//To test functions without loading the full server

const request = require("request");

function getSteamID(userinput){
    if(steamCommunityRegex.test(userinput)){

        let vanityUrl = userinput.split('steamcommunity.com/id/')[1];
        if(vanityUrl===''){
            vanityUrl = userinput.split('steamcommunity.com/profiles/')[1];
        }
        vanityUrl = vanityUrl.split('/')[0];

        let apiUrl = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + steamAPIKey+ '&vanityurl=' +vanityUrl;

        request(apiUrl, (error, response, body) => {
            if (error || response.statusCode !== 200) return console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
            let steamid = JSON.parse(body).response.steamid;
            console.log(steamid);
            return steamid;

        });
    }
    else {
        console.log("That is not a valid Steam profile url!")
    }
}