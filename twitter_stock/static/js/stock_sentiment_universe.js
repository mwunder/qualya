'use strict';

var printUniverseInfo = function() {

    //print info about the stock universe to the page
    var universe = document.createElement("p");

    universe.id = "universe";

    if(SYMBOLS.length>0) {

        universe.appendChild(document.createTextNode("On "+DATE+", the Universe contains "+SYMBOLS.length+" stock(s)."));

    } else {

        universe.appendChild(document.createTextNode("Sorry, but there are no stocks in the Universe on "+DATE+"."));
    }

    document.getElementById("universe-container").appendChild(universe);
}


var addSentimentBars = function() {

    //add sentiment bars to the page
    for(var i=0; i<SYMBOLS.length; i++) {

        var s_bar   = document.createElement("canvas"),
            context = s_bar.getContext('2d'); 

        s_bar.className = "sentiment-bar";
        s_bar.width     = 500;
        s_bar.height    = 50;

        context.fillStyle = "red";
        context.fillRect(0, 0, s_bar.width, s_bar.height);

        document.getElementById("sentiment-bar-container").appendChild(s_bar);
    }
}

