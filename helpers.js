module.exports = {
    getCurrentYear: function(){
        return new Date().getFullYear();
    },
    getStateClass: function(personastate){
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
    },
    getTradabilityIcon: function(tradability){
        var tradabilityIcon = "fa-check";
        if(tradability!=="Tradable"){
            tradabilityIcon ="fa-ban";
        }
        return tradabilityIcon;
    }
};