import * as fs from 'fs';

import chalk from 'chalk';

import Discogs from 'disconnect';

const API_KEY = 'fMqGRsEIhCyVdLxYBFqnhGSMsvhijgzCIxmTNneo';

const CONSUMER_KEY = 'YKpNFObfMIazUFSiMnbb';
const CONSUMER_SECRET = 'QlaIwjQYLjIZeRucQyWkPNdGccQSuUTS';

const database = new Discogs.Client({ userToken : API_KEY }).database();

const updatePlaylistCover = async () => {

    const playlists = JSON.parse(fs.readFileSync('./data/playlist.json', 'utf-8'));

    for (const key in playlists) {

        const playlist = playlists[key];

        // store main loop to break it when API cannot respond
        mainLoop: for (const playlistItemKey in playlist) {

            const playlistItem = playlist[playlistItemKey];

            const query = `${playlistItem.artist} - ${playlistItem.title}`;

            try {

                const currentPlaylistItem = playlists[key][playlistItemKey];

                if (currentPlaylistItem.cover || currentPlaylistItem.coverURL) {
                    console.log(chalk.yellow(`${query} have already a cover. Skip...`));
                    continue;
                }
                
                // Query API
                const data = await database.search(query);

                // Try to find cover in data
                const cover = data.results?.[0]?.cover_image;

                if (!cover) {
                    console.error(chalk.red(`${playlistItem.artist} or ${query} cover not found`));
                    continue;
                }

                // update main json object
                currentPlaylistItem.coverURL = cover;

                console.log(query);
                console.log(cover);
                console.log('-------------------------------');
            }
            catch(e) {
                console.error(chalk.red(`Error while query API`));
                break mainLoop;
            }
        }
    }

    // write in playlist json file with update json object
    fs.writeFile('./data/playlist.json', JSON.stringify(playlists), error => {

        if (error) {
            return console.error(chalk.red(`An error occured while updating playlist json file`), error);
        }

        console.log(chalk.green(`Playlist json file updated !`));
    });

    // TODO
    // cURL cover and store media in local file system

};

(async () => {
    updatePlaylistCover();
})();