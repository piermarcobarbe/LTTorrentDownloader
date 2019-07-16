const request = require('request');
const HTMLParser = require('node-html-parser');
const websiteURL = "https://linuxtracker.org/";
const torrentDir = "./downloads/";
const fs = require("fs");
var http = require('http');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'



if(!(fs.existsSync(torrentDir))){
	console.log(torrentDir + " does not exist. Creating " + torrentDir);
	fs.mkdirSync(torrentDir);
	console.log("Created " + torrentDir);
}


request("https://linuxtracker.org/index.php", function (err, res, body) {
    if (err) throw err;
    // console.log(body);

    if (!body) throw new Error("No Body received!");

    let parsedHTML = HTMLParser.parse(body);

    let torrentsListHREF = parsedHTML.querySelectorAll(".lasttor");

    // console.log(torrentsListHREF);

    var HREFs = [];


    for (let torrentHREF in torrentsListHREF){
        let href = torrentsListHREF[torrentHREF].attributes.href;


        // console.log(href);

        if(href.substr(0, 8) === "torrents"){
            HREFs.push(websiteURL + href);
            // console.log(HREFs.length);
        }
    }

    for(href in HREFs){


        request(HREFs[href], function (err, res, body) {
            if (err) throw err;

            // console.log(res);

            let parsedHTML = HTMLParser.parse(body);

            // console.log(parsedHTML);

            let aTags = parsedHTML.querySelectorAll("a");


            for (aTag in aTags){
                let finalURL = aTags[aTag].rawAttributes.href;

                if (finalURL) if (finalURL.includes("index.php?page=downloadcheck")){

                    finalURL = finalURL.replace(/&amp;/g, "&" );
                    // console.log(finalURL);

                    request(websiteURL + finalURL, function (err, res, body) {

                        if (err) throw err;

                        // console.log(res);
                        // console.log(body);

                        aTags = HTMLParser.parse(body);

                        aTags = aTags.querySelectorAll("a");

                        for (a in aTags){
                            aTags[a] = aTags[a].rawAttrs;
                            if (aTags[a] && (aTags[a].includes("href='download.php?id="))){
                                let finalHref = aTags[a].split("'")[1];
                                finalHref = finalHref.replace(/&amp;/g, "&" );

                                console.log(finalHref);

                                let filename = finalHref;
                                filename = filename.split("&")[1];
                                filename = filename.split("=")[1];


                                console.log(filename);
                                let fileWrite = request(websiteURL + finalHref).pipe(fs.createWriteStream(torrentDir + filename));

                                fileWrite.on('finish', function () {
                                    console.log("DONE " + torrentDir + filename);
                                })

                            }
                        }

                        // console.log(aTags);

                    });

                }

                // console.log(finalURL + " " +  finalURL.includes("index.php?page=downloadcheck"));
            }

            // console.log(aTags);

        });


    }

});

finalHref = "download.php?id=a1a05c1e22f1270defb2bad1fabe3b1c53992bb6&f=Android+Pie+9.0+Raspberry+Pi+3+LineageOS+UNOFFICIAL.torrent&key=6c2d037a";
