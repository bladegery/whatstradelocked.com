
$(document).ready(function(){

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