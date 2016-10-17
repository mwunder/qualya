'use strict';

var symbolFound = function() {

    if(SYMBOLS.length!==0) { return true } else { return false }
}


var notifyNotFound = function() {

    //notify the user that no data exists for the selected symbol on the chosen date
    var not_found_notif = document.createElement('p');

    not_found_notif.id = "not-found-notif";
    not_found_notif.appendChild(document.createTextNode("Sorry, no results on "+DATE+" for symbol "+SYMBOL+" ."));

    document.getElementById("info-container").appendChild(not_found_notif);
}


var printUniverseInfo = function() {

    //print info about the stock universe to the page
    var universe = document.createElement("p");

    universe.id = "universe";
    universe.appendChild(document.createTextNode("Universe on "+DATE+": "+SYMBOLS.length+" stock(s)."));

    document.getElementById("info-container").appendChild(universe);
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


