//To test functions without loading the full server

const request = require("request");

//
//
// request('https://steamcommunity.com/profiles/765611986161235/inventory/json/730/2', (error, response, body) => {
//     console.log(response.statusCode);
//     if(response.statusCode === 429){
//         res.render('index.hbs', {
//             items: [],
//             error: 'Could not get inventory from Steam, try again later?'
//         });
//     }
//     if (error || response.statusCode !== 200) return console.log(`Error: ${error} - Status Code: ${response.statusCode}`);
// });
//

