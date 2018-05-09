const express = require('express'),
    hbs = require('hbs'),
    bodyParser = require('body-parser'),
    request = require("request"),
    steamIDConvertor = require("steam-id-convertor"),
    app = express();


// const { check, validationResult } = require('express-validator/check');
// const { matchedData, sanitize } = require('express-validator/filter');

const steam_static_image_url = 'https://steamcommunity-a.akamaihd.net/economy/image/',
    iconSize = '/96fx96f', //can switch number to 128, 256, etc. for larger or 32, etc. for smaller
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

app.post("/",function(req,res){
    // sanitize(req.body.steam_user_input).trim().escape()=>{
    //
    // }
    getSteamID64(req.body.steam_user_input).then((steamid) => {
        res.redirect('/inventory/'+steamid);
    }).catch((err) => {
        res.render('index.hbs', {
            items: [],
            error: err
        });
    });
});


app.get('/inventory/:id', function (req, res, next) {
    if(steamID64regex.test(req.params.id)){
    getInventory(req.params.id).then((inventory) => {
        res.render('index.hbs', {
            items: inventory
        });
    }).catch((err) => {
        res.render('index.hbs', {
            items: [],
            error: err
        });
    });
    }
    else{
        res.render('index.hbs', {
            items: [],
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

            let items = JSON.parse(body).rgDescriptions;


            let itemsPropertiesToReturn = [];

            for (let item in items) {
                if (items[item].marketable === 1) {
                    let name = items[item].name;
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

                    itemsPropertiesToReturn.push({
                        name: name,
                        exterior: exterior,
                        type: type,
                        icon: icon,
                        namecolor: namecolor,
                        iconLarge: iconLarge,
                        tradability: tradability.toString(),
                    })
                }
            }
            resolve(itemsPropertiesToReturn);
        });
    });
}


hbs.registerHelper('getCurrentYear', () =>{
    return new Date().getFullYear()
});

hbs.registerHelper('screamIt', (text) =>{
    return text.toUpperCase()
});

app.get('/', (req, res) => {
    res.render('index.hbs', {
        pageTitle: 'What\'s tradable',
        currentYear: new Date().getFullYear(),
        items: 'empty'
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log('Server is up');
});
