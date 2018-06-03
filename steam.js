const SteamUser = require("steam-user"),
    SteamTotp = require("steam-totp"),
    SteamCommunity = require("steamcommunity"),
    community = new SteamCommunity(),
    client = new SteamUser();

client.logOn({
    accountName: "whatstradelockedcom",
    password: "uqk69SO$$@AgoWaYv1D2W6Of",
    twoFactorCode: SteamTotp.getAuthCode("+iDLuMbDvLVR15lmWEdgY88bDbY=")
});

client.on("loggedOn", (details, parental) => {
    community.getSteamUser(client.steamID, (err, user)=>{
        if(err){
            console.log("Steamcommunity or internet outage?")
        }
        else{
            console.log("Logged in as " + user.name);
        }
    });
});


client.on("webSession", (sessionID, cookies) => {
    // manager.setCookies(cookies, (ERR) => {
    //     if (ERR) {
    //         console.log("An error occurred while setting cookies.");
    //     } else {
    //         console.log("Websession Created And Cookies Set.");
    //     }
    // });

    community.setCookies(cookies);
});

community.on("sessionExpired", (ERR) => {
    client.webLogOn();
});


module.exports.getInventory = (steamid)=> {
    return new Promise((resolve, reject) => {

        userID = new SteamID(steamid);


        function get(inventory) {
            self.httpRequest({
                "uri": "https://steamcommunity.com/inventory/" + userID.getSteamID64() + "/" + appID + "/" + contextID,
                "headers": {
                    "Referer": "https://steamcommunity.com/profiles/" + userID.getSteamID64() + "/inventory"
                },
                "qs": {
                    "l": language, // Default language
                    "count": 5000, // Max items per 'page'
                    "start_assetid": start
                },
                "json": true
            }, function(err, response, body) {
                if (err) {
                    if (err.message == "HTTP error 403" && body === null) {
                        // 403 with a body of "null" means the inventory/profile is private.
                        if (self.steamID && userID.getSteamID64() == self.steamID.getSteamID64()) {
                            // We can never get private profile error for our own inventory!
                            self._notifySessionExpired(err);
                        }

                        callback(new Error("This profile is private."));
                        return;
                    }

                    if (err.message == "HTTP error 500" && body && body.error) {
                        err = new Error(body.error);

                        var match = body.error.match(/^(.+) \((\d+)\)$/);
                        if (match) {
                            err.message = match[1];
                            err.eresult = match[2];
                            callback(err);
                            return;
                        }
                    }

                    callback(err);
                    return;
                }

                if (body && body.success && body.total_inventory_count === 0) {
                    // Empty inventory
                    callback(null, [], [], 0);
                    return;
                }

                if (!body || !body.success || !body.assets || !body.descriptions) {
                    if (body) {
                        // Dunno if the error/Error property even exists on this new endpoint
                        callback(new Error(body.error || body.Error || "Malformed response"));
                    } else {
                        callback(new Error("Malformed response"));
                    }

                    return;
                }

                for (var i = 0; i < body.assets.length; i++) {
                    var description = getDescription(body.descriptions, body.assets[i].classid, body.assets[i].instanceid);

                    if (!tradableOnly || (description && description.tradable)) {
                        body.assets[i].pos = pos++;
                        (body.assets[i].currencyid ? currency : inventory).push(new CEconItem(body.assets[i], description, contextID));
                    }
                }

                if (body.more_items) {
                    get(inventory, currency, body.last_assetid);
                } else {
                    callback(null, inventory, currency, body.total_inventory_count);
                }
            }, "steamcommunity");
        }



















        request('https://steamcommunity.com/profiles/' + steamid + '/inventory/json/730/2', (error, response, body) => {
            if (response.statusCode === 429) {
                console.log('Rate limited');
                reject('Could not get inventory from Steam, try again later?');
                return;
            }
            if (error || response.statusCode !== 200) {
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

                    var description = "";
                    try {
                        if (items[item].descriptions !== undefined || items[item].descriptions[2] !== undefined) {
                            description = items[item].descriptions[2].value;
                        }
                    }
                    catch (error) {
                    }


                    var inspectLink = "";
                    try {
                        if (items[item].actions !== undefined || items[item].actions[0] !== undefined) {
                            inspectLink = items[item].actions[0].link;
                        }
                    }
                    catch (error) {
                    }


                    itemsPropertiesToReturn.push({
                        name: name,
                        exterior: exterior,
                        type: type,
                        icon: icon,
                        namecolor: namecolor,
                        iconLarge: iconLarge,
                        tradability: tradability,
                        description: description,
                        inspectLink: inspectLink
                    })
                }
            }
            resolve(itemsPropertiesToReturn);
        });
    });
};
