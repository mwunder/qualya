'use strict';

var DEBUG_UNIVERSE = true;

/* METHODS ========================================================================================================================================*/

var addIntervalButtonClickEvents = function() {

    ["zoom-in-button", "zoom-out-button"].forEach(function(button, index) {

        var w = index == 0 ? Math.round(2*timeFrame,0) : Math.round(0.5*timeFrame,0);

        document.getElementById(button).onclick = function() {

            location.href = "/stock_sentiment_historical/?symbol="+SYMBOL+"&w="+w+"&date="+DATE;
        }
    });
}

var addGoButtonClickEvent = function() {

    document.getElementById("go-button").onclick = function() {

        var selected = document.getElementById("ticker-dropdown-2").value;

        location.href = "/stock_sentiment_historical/?symbol="+selected+"&w="+timeFrame+"&date="+DATE;
    }
}
