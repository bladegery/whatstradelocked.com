
$(document).ready(function(){

    // var filtersList ={
    //     'Falchion Knife': 0,
    //     'Gut Knife': 0,
    //     'Shadow Daggers': 0,
    //     'Flip Knife': 0,
    //     'Huntsman Knife': 0,
    //     'Bowie Knife': 0,
    //     'Bayonet': 0,
    //     'M9 bayonet': 0,
    //     'Butterfly Knife': 0,
    //     'Karambit': 0,
    //
    //
    // };

    $("#onPageSearch").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".inventoryItem").filter(function() {
            $(this).toggle($(this).attr("data-keywords").toLowerCase().indexOf(value) > -1)
        });
    });

    $("#resetFilters").on("click", function() {
        $(".inventoryItem").each(function() {
            $(this).show();
        });
    });

    $(".filterIcon").on("click", function() {
        $(this).toggleClass('clickedIcon');
        var weapon = $(this).attr("data-weapon");
        // (filtersList[weapon] === 0) ? filtersList[weapon] = 1 : filtersList[weapon] = 0;

        $(".inventoryItem").each(function() {
            let $item = $(this);
            console.log($item);
            console.log(weapon);
            console.log($item.attr("data-weapon"));
            console.log($item.attr("data-weapon")!==weapon);

            // $item.toggle($item.attr("data-weapon")!==weapon);
            if($item.attr("data-weapon")!==weapon){
                $item.toggle();
            }

            // let $item = $(this);
            // if($item.attr("data-weapon")===weapon||filtersList[$item.attr("data-weapon")]===1){
            //     $item.show();
            // }
            // else{
            //     $item.hide();
            // }
        });
    });


    $( ".inspect" ).each(function() {
        if($(this).attr("href")===""){
            $(this).hide();
        }
    });

    $( ".inventoryItem" ).each(function() {
        let $item = $(this);
        if($(this).children(".countdown").attr("data-countdown")!=="Tradable"){
            $item.css("border-color", "red");
        }
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
});