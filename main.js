const request = require('request');
const HTMLParser = require('node-html-parser');
const websiteURL = "https://linuxtracker.org/";
var torrentDir = "./downloads/";
const fs = require("fs");
var http = require('http');
var path = require('path');
var outputFile;


// Ignore invalid HTTPS cert
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

console.log(process.argv);

if(process.argv.length > 2){
    let tempTorrentDir = process.argv[2];
    if(tempTorrentDir ){
        torrentDir = tempTorrentDir;
        torrentDir = path.normalize(torrentDir + "/");
        console.log("Download dir set to " + torrentDir);
    }

    if(process.argv[3]) outputFile = process.argv[3];

    if(outputFile) console.log("Using " + outputFile + " for storing result.")
}

// Create download dir, where torrents will be stored.
if(!(fs.existsSync(torrentDir))){
	console.log("Directory " + torrentDir + " does not exist. Creating " + torrentDir);
	fs.mkdirSync(torrentDir);
	// console.log("Created " + torrentDir);
}


// Request to linuxtracker homepage
request("https://linuxtracker.org/index.php", function (err, res, body) {
    if (err) throw err;
    // console.log(body);

    if (!body) throw new Error("No Body received!");

    let parsedHTML = HTMLParser.parse(body);

    let torrentsListHREF = parsedHTML.querySelectorAll(".lasttor");

    // console.log(torrentsListHREF);
    // Gathering all URLs to torrents, having ".lasttor" class in it
    var HREFs = [];


    for (let torrentHREF in torrentsListHREF){
        let href = torrentsListHREF[torrentHREF].attributes.href;


        // console.log(href);
        // Is it a URL to a torrent description page?
        if(href.substr(0, 8) === "torrents"){
            HREFs.push(websiteURL + href);
            // console.log(HREFs.length);
        }
    }

    for(href in HREFs){
        // Visiting previously gathered URLs this may be the description page of a torrent
        request(HREFs[href], function (err, res, body) {
            if (err) throw err;

            let parsedHTML = HTMLParser.parse(body);

            // All URLs in description page of the torrent
            let aTags = parsedHTML.querySelectorAll("a");
            for (aTag in aTags){
                let finalURL = aTags[aTag].rawAttributes.href;
                if (finalURL) if (finalURL.includes("index.php?page=downloadcheck")){
                    finalURL = finalURL.replace(/&amp;/g, "&" );

                    // URL to page containing the torrent file
                    request(websiteURL + finalURL, function (err, res, body) {
                        if (err) throw err;

                        aTags = HTMLParser.parse(body);
                        aTags = aTags.querySelectorAll("a");

                        for (a in aTags){
                            aTags[a] = aTags[a].rawAttrs;
                            if (aTags[a] && (aTags[a].includes("href='download.php?id="))){
                                let finalHref = aTags[a].split("'")[1];

                                finalHref = finalHref.replace(/&amp;/g, "&" );

                                let filename = finalHref;

                                filename = filename.split("&")[1];
                                filename = filename.split("=")[1];

                                // console.log("Requesting " + finalHref);
                                // Streaming downloaded torrent data to file

                                let torrentFile = torrentDir + filename;
                                if(!fs.existsSync(torrentFile)){
                                    let fileWrite = request(websiteURL + finalHref).pipe(fs.createWriteStream(torrentFile));

                                    fileWrite.on('finish', function () {
                                        console.log("DONE " + torrentDir + filename);
                                        if(outputFile){
                                            fs.appendFile(outputFile , torrentFile + "\n", function (err) {
                                                if (err) throw err;
                                            });
                                        }
                                    })
                                } else {
                                    console.log("Torrent " + torrentFile + " exists yet.")
                                }


                            }
                        }
                    });
                }
            }
        });
    }
});