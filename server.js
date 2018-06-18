const express = require('express'),
    hbs = require('hbs'),
    bodyParser = require('body-parser'),
    request = require("request"),
    steamIDConvertor = require("steam-id-convertor"),
    app = express(),
    SteamUser = require("steam-user"),
    SteamTotp = require("steam-totp"),
    SteamCommunity = require("steamcommunity"),
    community = new SteamCommunity(),
    client = new SteamUser();
// steam = require("./steam.js");


// const { check, validationResult } = require('express-validator/check');
// const { matchedData, sanitize } = require('express-validator/filter');

const steam_static_image_url = 'https://steamcommunity-a.akamaihd.net/economy/image/',
    iconSize = '/256fx256f', //can switch number to 128, 256, etc. for larger or 32, etc. for smaller
    steamAPIKey = '083D3F215CEFFEE1911D32AC211B2B85',
    steamCommunityRegex = new RegExp('steamcommunity.com/id/|steamcommunity.com/profiles/|steamcommunity.com/tradeoffer/new/\\?partner='),
    steamID64regex = new RegExp('[0-9]{17}');



hbs.registerPartials(__dirname +'/views/partials');
app.set('view-engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use((req, res, next) =>{
    var now = new Date().toString();
    console.log(`${now}: ${req.originalUrl} ${req.method}`);
    next();
});

//TODO:
//sanitize input fields before adding database
//sorting

app.post("/",function(req,res){
    // sanitize(req.body.steam_user_input).trim().escape()=>{
    //
    // }
    getSteamID64(req.body.steam_user_input).then((steamid) => {
        res.redirect('/inventory/'+steamid);
    }).catch((err) => {
        res.render('index.hbs', {
            error: err
        });
    });
});

app.get("/", (req, res) => {
    res.render('index.hbs', {});
});

app.get("/changelog",function(req,res){
    res.render('changelog.hbs',{});
});

app.get("/inventory/:id", function (req, res, next) {
    if(steamID64regex.test(req.params.id)){
        getInventory(req.params.id).then((inventory) => {
            getProfileDetails(req.params.id).then((profiledetails) => {
                res.render('inventory.hbs', {
                    items: inventory,
                    itemCount: inventory.length,
                    profiledetails: profiledetails
                });
            }).catch((err) => {
                res.render('index.hbs', {
                    error: "Could not get Steam Profile information,  try again later?"
                });
            });
        }).catch((err) => {
            res.render('index.hbs', {
                error: "Could not get inventory from Steam, try again later?"
            });
        });
    }
    else{
        res.render('index.hbs', {
            error: 'That is not a valid steam id!'
        });
    }
});

function getSteamID64(user_input) {
    return new Promise((resolve, reject)=>{
        if(steamCommunityRegex.test(user_input)) {
            let idOrVanityURL = getVanityOrID(user_input);

            if (steamID64regex.test(idOrVanityURL)) {
                resolve(idOrVanityURL);
            }
            else if (parseInt(idOrVanityURL) < 2147483647) {
                resolve(steamIDConvertor.to64(idOrVanityURL));
            }
            request('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + steamAPIKey + '&vanityurl=' + idOrVanityURL, (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
                    reject('Couldn\'t get profile from Steam at this time');
                    return
                }
                let steamIDResponse = JSON.parse(body).response.steamid;

                if (steamIDResponse === undefined) {
                    reject('That is not a valid Steam profile or trade link!');
                }
                else {
                    resolve(steamIDResponse);
                }
            });
        }
        else{
            reject('That is not a valid Steam profile or trade link!');
        }
    });
}

function getVanityOrID(steam_url){
    let idOrVanityURL = steam_url.split('steamcommunity.com/id/')[1];
    if(idOrVanityURL===undefined){
        idOrVanityURL = steam_url.split('steamcommunity.com/profiles/')[1];
    }
    if(idOrVanityURL===undefined){
        idOrVanityURL = steam_url.split('steamcommunity.com/tradeoffer/new/?partner=')[1];
        idOrVanityURL = idOrVanityURL.split('&')[0];
    }
    else{
        idOrVanityURL = idOrVanityURL.split('/')[0];
    }
    return idOrVanityURL;
}

function getInventory(steamid){
    return new Promise((resolve, reject)=>{
        request('https://steamcommunity.com/profiles/' + steamid + '/inventory/json/730/2', (error, response, body) => {
            try{
                if (response.statusCode === 429) {
                    console.log('Rate limited');
                    reject('Could not get inventory from Steam, try again later?');
                    return;
                }
                if (error || response.statusCode !== 200){
                    console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
                    reject('Could not get inventory from Steam, try again later?');
                    return;
                }

                if (!JSON.parse(body).success) {
                    console.log(JSON.parse(body).Error);
                    reject('Could not get inventory from Steam, try again later?');
                    return;
                }

                var items = JSON.parse(body).rgDescriptions;
                var ids = JSON.parse(body).rgInventory;
            }
            catch (error) {
                console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
                reject('Could not get inventory from Steam, try again later?');
                return;
            }

            let itemsPropertiesToReturn = [];

            for (let asset in ids) {
                var assetid = ids[asset].id;
                var position = ids[asset].pos;

                for (let item in items) {
                    if(ids[asset].classid===items[item].classid&&ids[asset].instanceid===items[item].instanceid){
                        let name = items[item].name;
                        let marketlink = "https://steamcommunity.com/market/listings/730/" + items[item].market_hash_name;
                        let classid = items[item].classid;
                        let instanceid = items[item].instanceid;
                        let exterior = items[item].descriptions[0].value.split('Exterior: ')[1];
                        exterior = exterior === undefined ? "" : exterior;
                        let namecolor = items[item].name_color;
                        let icon = steam_static_image_url + items[item].icon_url + iconSize;
                        let iconLarge = steam_static_image_url + items[item].icon_url_large;
                        let type = items[item].type;
                        let tradability = "Tradable";


                        if (items[item].tradable === 0) {
                            tradability = new Date(items[item].cache_expiration);
                        }

                        if(items[item].marketable === 0){
                            tradability = "Non-Tradable"
                        }

                        var description ="";
                        try {
                            if(items[item].descriptions!==undefined||items[item].descriptions[2]!==undefined){
                                description = items[item].descriptions[2].value;
                            }
                        }
                        catch(error) {
                        }

                        var category ="";
                        try {
                            if(items[item].tags!==undefined||items[item].tags[0]!==undefined){
                                category = items[item].tags[0].name;
                            }
                        }
                        catch(error) {
                        }

                        var weapon ="";
                        try {
                            if(items[item].tags!==undefined||items[item].tags[1]!==undefined){
                                weapon = items[item].tags[1].name;

                                if(category==="Key"){
                                    weapon="Key";
                                }
                                if(category==="Gloves"){
                                    weapon="Gloves";
                                }
                                if(category==="Music Kit"){
                                    weapon="Music Kit";
                                }
                                if(category==="Graffiti"){
                                    weapon="Graffiti";
                                }
                                if(category==="Container"){
                                    weapon="Case";
                                }
                                if(category==="Collectible"){
                                    weapon="Pin";
                                }
                            }
                        }
                        catch(error) {
                        }

                        var quality = "stock";
                        if(/Base Grade/i.test(type)){
                            quality ="base_grade";
                        }
                        else if(/Classified/i.test(type)){
                            quality ="classified";
                        }
                        else if(/Consumer Grade/i.test(type)){
                            quality ="consumer_grade";
                        }
                        else if(/Contraband/i.test(type)){
                            quality ="contraband";
                        }
                        else if(/Covert/i.test(type)){
                            quality ="covert";
                        }
                        else if(/Exotic/i.test(type)){
                            quality ="exotic";
                        }
                        else if(/Extraordinary/i.test(type)){
                            quality ="extraordinary";
                        }
                        else if(/High Grade/i.test(type)){
                            quality ="high_grade";
                        }
                        else if(/Industrial Grade/i.test(type)){
                            quality ="industrial_grade";
                        }
                        else if(/Mil-Spec Grade/i.test(type)){
                            quality ="milspec_grade";
                        }
                        else if(/Remarkable/i.test(type)){
                            quality ="remarkable";
                        }
                        else if(/Restricted/i.test(type)){
                            quality ="restricted";
                        }
                        else if(/Stock/i.test(type)){
                            quality ="stock";
                        }

                        var nametag ="";
                        try {
                            if(items[item].fraudwarnings!==undefined||items[item].fraudwarnings[0]!==undefined){
                                nametag = items[item].fraudwarnings[0].split('Name Tag: ')[1];
                            }
                        }
                        catch(error) {
                        }


                        var inspectLink ="";
                        try {
                            if(items[item].actions!==undefined||items[item].actions[0]!==undefined){
                                let beggining = items[item].actions[0].link.split('%20S')[0];
                                let end = items[item].actions[0].link.split('%assetid%')[1];
                                inspectLink = beggining + "%20S"+steamid + "A"+ assetid + end;
                            }
                        }
                        catch(error) {
                        }

                        var keywords = `${name} ${items[item].market_hash_name} ${type} ${nametag} ${quality} ${category} ${weapon.toLowerCase() + name.split('|')[1]}`;


                        itemsPropertiesToReturn.push({
                            name: name,
                            marketlink: marketlink,
                            classid: classid,
                            instanceid: instanceid,
                            assetid: assetid,
                            exterior: exterior,
                            type: type,
                            icon: icon,
                            namecolor: namecolor,
                            iconLarge: iconLarge,
                            tradability: tradability,
                            quality: quality,
                            nametag: nametag,
                            inspectLink: inspectLink,
                            description: description,
                            keywords: keywords.toLowerCase(),
                            category: category,
                            weapon: weapon,
                            position: position
                        })
                    }
                }
            }

            function compare(a,b) {
                return a.position - b.position;
            }

            itemsPropertiesToReturn.sort(compare);
            resolve(itemsPropertiesToReturn);
        });
    });
}

function getProfileDetails(steamid){
    return new Promise((resolve, reject)=>{
        request('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + steamAPIKey + '&steamids=' + steamid, (error, response, body) => {
            if (error) {
                console.log('Could not load steam profile information');
                reject({error: 'Could not load steam profile information'});
                return;
            }
            try {
                var player = JSON.parse(body).response.players[0];
            }
            catch (error) {
                console.log('Could not load steam profile information');
                reject({error: 'Could not load steam profile information'});
                return;
            }

            var personastate = 'Offline';

            switch (player.personastate) {
                case 0: personastate = 'Offline'; break;
                case 1: personastate = 'Online'; break;
                case 2: personastate = 'Busy'; break;
                case 3: personastate = 'Away'; break;
                case 4: personastate = 'Snooze'; break;
                case 5: personastate = 'Looking to trade'; break;
                case 6: personastate = 'Looking to play'; break;
                default: personastate = 'Offline';
            }

            try {
                if(player.gameid!==undefined||player.gameid>=0){
                    personastate = 'In-game: ' + player.gameextrainfo;
                }
            }
            catch(error) {
            }

            let steamRepProfile = 'https://steamrep.com/profiles/'+steamid;

            resolve({
                error: 0,
                personaname: player.personaname,
                realname: player.realname,
                profileurl: player.profileurl,
                avatar: player.avatarfull,
                personastate: personastate,
                lastlogoff: player.lastlogoff,
                timecreated: player.timecreated,
                country: player.loccountrycode,
                steamRepProfile: steamRepProfile
            });
        });
    });
}


hbs.registerHelper('getCurrentYear', () =>{
    return new Date().getFullYear()
});

hbs.registerHelper('getStateClass', (personastate) =>{
    var stateClass = "online";
    if(/Offline/i.test(personastate)){
        stateClass ="offline";
    }
    else if(/Online|Busy|Away|Snooze|Looking to trade|Looking to play/i.test(personastate)){
        stateClass ="online"
    }
    else if(/In-game:/i.test(personastate)){
        stateClass ="ingame"
    }
    return stateClass;
});


hbs.registerHelper('getTradabilityIcon', (tradability) =>{
    var tradabilityIcon = "fa-check";
    if(tradability!=="Tradable"){
        tradabilityIcon ="fa-ban";
    }
    return tradabilityIcon;
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log('Server is up');
});
