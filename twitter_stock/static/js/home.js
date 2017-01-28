'use strict';

var addSearchButtonClickEvent = function() {

    document.getElementById("search-button").onclick = function() {

        var selected = document.getElementById("ticker-dropdown-1").value;

        if(selected == "All") {

            location.href = "/stock_sentiment_universe/?symbol=All";

        } else {

            location.href = "/stock_sentiment_historical/?symbol="+selected+"&w=45&date="+DATE;
        }
    }
}
