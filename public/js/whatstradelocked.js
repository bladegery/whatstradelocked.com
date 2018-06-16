
$(document).ready(function(){

    var filters ={
        filter: 0,
        nametag: 0,
        stattrak: 0,
        time: 0
    };

    var weaponFilters ={
        filter: 0,
        'Falchion Knife': 0,
        'Gut Knife': 0,
        'Shadow Daggers': 0,
        'Flip Knife': 0,
        'Huntsman Knife': 0,
        'Bowie Knife': 0,
        'Bayonet': 0,
        'M9 Bayonet': 0,
        'Butterfly Knife': 0,
        'Karambit': 0,
        'AK-47': 0,
        'AUG': 0,
        'AWP': 0,
        'FAMAS': 0,
        'G3SG1': 0,
        'Galil AR': 0,
        'M4A4': 0,
        'M4A1-S': 0,
        'SCAR-20': 0,
        'SG 553': 0,
        'SSG 08': 0,
        'CZ75-Auto': 0,
        'Desert Eagle': 0,
        'Dual Berettas': 0,
        'Five-SeveN': 0,
        'Glock-18': 0,
        'P2000': 0,
        'P250': 0,
        'R8 Revolver': 0,
        'Tec-9': 0,
        'USP-S': 0,
        'MAC-10': 0,
        'MP7': 0,
        'PP-Bizon': 0,
        'P90': 0,
        'MAG-7': 0,
        'Nova': 0,
        'Sawed-Off': 0,
        'XM1014': 0,
        'M249': 0,
        'Negev': 0,
        'UMP-45': 0,
        'Key': 0,
        'Gloves': 0,
        'Case': 0,
        'Pin': 0,
        'Music Kit': 0,
        'Graffiti': 0,

    };

    $("#onPageSearch").on("keyup", function() {
        needfilters();
        var value = $(this).val().toLowerCase();
        $(".inventoryItem").filter(function() {
            if($(this).css('display') !== 'none'){
                $(this).toggle($(this).attr("data-keywords").toLowerCase().indexOf(value) > -1)
            }
        });
    });

    $("#resetFilters").on("click", function() {
        $(".filterIcon").each(function () {
            $(this).removeClass('clickedIcon');
        });
        removeFilters();
    });

    $("#nametagFilter").on("click", function() {
        if(filters.nametag===0){
            filters.nametag=1;
            filters.filter=filters.filter+1;
        }
        else{
            filters.nametag=0;
            filters.filter=filters.filter-1;
        }
        needfilters();
    });

    $("#statTrakFilter").on("click", function() {
        if(filters.stattrak===0){
            filters.stattrak=1;
            filters.filter=filters.filter+1;
        }
        else{
            filters.stattrak=0;
            filters.filter=filters.filter-1;
        }
        needfilters();
    });

    $(".filterIcon").each(function () {
        $(this).tooltip();
    });

    $(".filterIcon").on({
        click: function() {
            var filter = $(this);
            if ($(this).hasClass('filterWeaponIcon')) {
                let weapon = filter.attr('data-weapon');

                if(weaponFilters[weapon] === 0){
                    weaponFilters[weapon] = 1;
                    weaponFilters.filter=weaponFilters.filter+1;
                }
                else{
                    weaponFilters[weapon] = 0;
                    weaponFilters.filter=weaponFilters.filter-1;
                }
                needfilters();
            }
            $(this).toggleClass('clickedIcon');
        }
    });

    $( ".inspect" ).each(function() {
        if($(this).attr("href")===""){
            $(this).hide();
        }
    });

    $( ".actionIcons" ).each(function() {
        $(this).tooltip();
    });

    $( "[data-countdown]" ).each(function() {
        let $this = $(this);

        if(!($this.attr("data-countdown")==='Tradable')){
            let countDownDate =  new Date($this.attr("data-countdown"));

            let x = setInterval(function() {
                let now = new Date().getTime();
                let distance = countDownDate - now;

                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                $this.text(days + "d " + hours + "h "
                    + minutes + "m " + seconds + "s ");

                if (distance < 0) {
                    clearInterval(x);
                    $this.text("Tradable");
                }
            }, 1000);
        }
    });

    $( ".itemName" ).each(function() {
        $itemName = $(this);

        var name = $itemName.text().split("| ")[1];
        $itemName.text(name);
        $itemName.tooltip();
    });

    $( ".statTrak" ).each(function() {
        var itemName = $(this).attr("data-name");

        if(/StatTrak™/.test(itemName)){
            $(this).text("StatTrak™")
        }
    });

    $( ".exterior" ).each(function() {
        $(this).tooltip();
    });


    let slider = document.getElementById("lock_time_slider");
    let output = document.getElementById("daysleft");
    output.innerHTML = slider.value;

    slider.oninput = function() {
        output.innerHTML = this.value;
        let now = new Date().getTime();
        let days = this.value;

        if(days>=8){
            filters.time=0;
        }

        $( "[data-countdown]" ).each(function() {
            let $this = $(this);

            if(!($this.attr("data-countdown")==='Tradable')){
                let countDownDate =  new Date($this.attr("data-countdown"));
                let distance = countDownDate - now;

                if (distance < days*(1000 * 60 * 60 * 24)) {
                    $this.parent().show();
                }
                else{
                    $this.parent().hide();
                }
            }
        });
        filters.time=filters.time+1;
        applyFilters();
    };

    function removeFilters(){
        $(".inventoryItem").each(function() {
            $(this).show();
        });

        for (var weap in weaponFilters) {
            if (!weaponFilters.hasOwnProperty(weap)) {
                continue;
            }
            weaponFilters[weap]=0;
        }

        for (var filter in filters) {
            if (!filters.hasOwnProperty(filter)) {
                continue;
            }
            filters[filter]=0;
        }
        slider.value=8;
    }

    function applyFilters() {
        $(".inventoryItem").each(function() {
            $item = $(this);

            if(weaponFilters.filter===0){

                if(filters.time>0&&$item.css('display') === 'none') {
                    $item.hide();
                }
                else{
                    $item.show();
                }

                if (filters.nametag === 1) {
                    if ($item.attr("data-nametag") === "") {
                        $item.hide();
                    }
                }
                if (filters.stattrak === 1) {
                    if (!(/StatTrak™/.test($item.attr("data-name")))) {
                        $item.hide();
                    }
                }
            }
            else{
                if((weaponFilters[$item.attr("data-weapon")]===1)){
                    if(filters.time>0&&$item.css('display') === 'none'){
                        $item.hide();
                    }
                    else{
                        $item.show();
                    }

                    if(filters.nametag===1){
                        if($item.attr("data-nametag")===""){
                            $item.hide();
                        }
                    }
                    if(filters.stattrak===1) {
                        if (!(/StatTrak™/.test($item.attr("data-name")))) {
                            $item.hide();
                        }
                    }

                }
                else{
                    $item.hide();
                }
            }
        });
    }

    function needfilters() {
        console.log(weaponFilters);
        console.log(filters);
        if(filters.filter===0&&weaponFilters.filter===0){
            removeFilters();
        }
        else{
            applyFilters();
        }
    }
});