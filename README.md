## LinuxTracker Torrent Downloader
##### How to install it?
You will need Node.js and npm installed. Clone the repository, cd into it and then run:

``npm install``

##### How to run it?

``node main.js``.

##### Parameters available

You can pass 2 parameters to the process:

``node main.js [TORRENT_DIRECTORY] [LOG_FILE]``

In ``TORRENT_DIRECTORY``, downloaded torrents will be stored: It will be created if not existing.
You can set your Transmission watched torrent directory, for example.

``LOG_FILE`` will be used for writing which files have been downloaded. 
Consecutive executions will append newly downloaded torrents in ``LOG_FILE``.
This file could then be sent via e-mail for getting notifications of the newly added torrents!