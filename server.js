const express = require('express'),
    hbs = require('hbs'),
    bodyParser = require('body-parser'),
    request = require("request"),
    app = express();


// const { body,validationResult } = require('express-validator/check');
// const { sanitizeBody } = require('express-validator/filter');

hbs.registerPartials(__dirname +'/views/partials');
app.set('view-engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use((req, res, next) =>{
    var now = new Date().toString();
    console.log(`${now}: ${req.method} `);
    next();
});

//TODO:
//secure input and make it more user friendly by accepting profile links
//Respond to user on private inventory request


const steam_static_image_url = 'https://steamcommunity-a.akamaihd.net/economy/image/';
const iconSize = '/96fx96f'; //can switch number to 128, 256, etc. for larger or 32, etc. for smaller
const steamAPIKey = '083D3F215CEFFEE1911D32AC211B2B85';
const steamCommunityRegex = new RegExp('steamcommunity.com/id/|steamcommunity.com/profiles/');
const steamIDregex = new RegExp('[0-9]{17}');

app.post("/",function(req,res){

    let userinput = req.body.steam_user_input;

        if(steamCommunityRegex.test(userinput)){

            let vanityUrl = userinput.split('steamcommunity.com/id/')[1];
            if(vanityUrl===''){
                vanityUrl = userinput.split('steamcommunity.com/profiles/')[1];
            }
            vanityUrl = vanityUrl.split('/')[0];

            let apiUrl = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + steamAPIKey+ '&vanityurl=' +vanityUrl;

            request(apiUrl, (error, response, body) => {
                if (error || response.statusCode !== 200) return console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
                let steamIDResponse = JSON.parse(body).response.steamid;

                let steamid = steamIDResponse;

                if(steamIDResponse===undefined){
                    if(steamIDregex.test(vanityUrl)){
                        steamid = vanityUrl;
                    }
                    else{
                        res.render('index.hbs', {
                            items: [],
                            error: 'That is not a valid Steam profile url!'
                        });
                        return
                    }
                }

                console.log("Getting items..");

                request('https://steamcommunity.com/profiles/' + steamid + '/inventory/json/730/2', (error, response, body) => {
                    if(response.statusCode === 429){
                        res.render('index.hbs', {
                            items: [],
                            error: 'Could not get inventory from Steam, try again later?'
                        });
                        return
                    }
                    if (error || response.statusCode !== 200) return console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
                    let items = JSON.parse(body).rgDescriptions;


                    let itemsArray = [];

                    for (let item in items) {
                        if(items[item].marketable===1) {
                            let name = items[item].name;
                            let exterior = items[item].descriptions[0].value.split('Exterior: ')[1];
                            exterior = exterior === undefined ? "" : exterior;
                            let namecolor = items[item].name_color;
                            let icon = steam_static_image_url + items[item].icon_url+iconSize;
                            let iconLarge = steam_static_image_url + items[item].icon_url_large;
                            let type = items[item].type;
                            let tradability = "Tradable";
                            if (items[item].tradable === 0) {
                                tradability = new Date(items[item].cache_expiration);
                            }

                            itemsArray.push({
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
                    res.render('index.hbs', {
                        items: itemsArray
                    });
                });

            });
        }
        else {
            res.render('index.hbs', {
                items: [],
                error: 'That is not a valid Steam profile url!'
            });
            return
        }
});

// app.post('/', function (req, res) {
//     res.send('POST request to the homepage');
//
//     exports.genre_create_post =  [
//
//         // Validate that the name field is not empty.
//         body('name', 'Genre name required').isLength({ min: 1 }).trim(),
//
//         // Sanitize (trim and escape) the name field.
//         sanitizeBody('name').trim().escape(),
//
//         // Process request after validation and sanitization.
//         (req, res, next) => {
//
//             // Extract the validation errors from a request.
//             const errors = validationResult(req);
//
//             // Create a genre object with escaped and trimmed data.
//             var genre = new Genre(
//                 { name: req.body.name }
//             );
//
//
//             if (!errors.isEmpty()) {
//                 // There are errors. Render the form again with sanitized values/error messages.
//                 res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
//                 return;
//             }
//             else {
//                 // Data from form is valid.
//                 // Check if Genre with same name already exists.
//                 Genre.findOne({ 'name': req.body.name })
//                     .exec( function(err, found_genre) {
//                         if (err) { return next(err); }
//
//                         if (found_genre) {
//                             // Genre exists, redirect to its detail page.
//                             res.redirect(found_genre.url);
//                         }
//                         else {
//
//                             genre.save(function (err) {
//                                 if (err) { return next(err); }
//                                 // Genre saved. Redirect to genre detail page.
//                                 res.redirect(genre.url);
//                             });
//
//                         }
//
//                     });
//             }
//         }
//     ];
//
// });


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
