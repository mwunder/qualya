'use strict';

//METHODS
var getDataIndex = function(callback) {

    for(var i=0; i<SYMBOLS.length; i++) {

        //if the selected symbol exists for the date, store array index of the data, then break
        if(sessionStorage.SYMBOL === SYMBOLS[i]) {

            sessionStorage.DATA_INDEX = i;
            break;
        }
    }

    //error handling
    callback = function() {

        if(!sessionStorage.DATA_INDEX) {

            var notif = document.createElement('p');

            notif.id = "notification";
            notif.style.textAlign = "center";

            document.getElementById("output-text-container").appendChild(notif);

            if(sessionStorage.SYMBOL) {

                notif.appendChild(document.createTextNode('Sorry, no results on this date for symbol '+sessionStorage.SYMBOL+'.'));
            } else {
                notif.appendChild(document.createTextNode('Please select a symbol before loading this page.'));
            }
        }
    }();
}


var printUniverseInfo = function() {

    //print info about the stock universe to the page
    var universe = document.createElement("p");

    universe.id = "universe";
    universe.appendChild(document.createTextNode("Universe on "+DATE+": "+SYMBOLS.length+" stock(s)."));

    document.getElementById("output-text-container").appendChild(universe);
}


var printSymbolData = function(array) {

    for(var i=0; i<array.length; i++) {

        var element = document.createElement('p');

        element.appendChild(document.createTextNode(array[i]));
        element.style.textAlign = "center";

        document.getElementById("output-text-container").appendChild(element);
    }
}


var addSentimentBar = function() {

    var s_bar   = document.createElement("canvas"),
        context = s_bar.getContext('2d'); 

    s_bar.id     = "sentiment-bar";
    s_bar.width  = 500;
    s_bar.height = 50;

    context.fillStyle = "red";
    context.fillRect(0, 0, s_bar.width, s_bar.height);

    document.getElementById("sentiment-bar-container").appendChild(s_bar);
}
