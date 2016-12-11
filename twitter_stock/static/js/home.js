'use strict';

var addFormAction = function() {

    if(document.getElementById("ticker-dropdown").value == "All") {

        document.getElementById("search-form").action = "/stock_sentiment_universe/";

    } else {

        document.getElementById("search-form").action = "/stock_sentiment_historical/";
    }
}

