'use strict';

var addSearchFormAction = function() {

    if(document.getElementById("ticker-dropdown-1").value == "All") {

        document.getElementById("search-form").action = "/stock_sentiment_universe/";

    } else {

        document.getElementById("search-form").action = "/stock_sentiment_historical/";
    }
}

