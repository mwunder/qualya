'use strict';

var populateDropDownMenu = function() {

    //local vars
    var sorted_symbols = SYMBOLS.sort(),
        all_option     = document.createElement("option");

    all_option.textContent = "All";
    document.getElementById("ticker-dropdown").appendChild(all_option);

    for(var i=0; i<sorted_symbols.length; i++) {

        //loop vars
        var ticker = sorted_symbols[i],
            option = document.createElement("option");

        option.textContent = ticker;
        document.getElementById("ticker-dropdown").appendChild(option);
    }
}


var addFormAction = function() {

    if(document.getElementById("ticker-dropdown").value == "All") {

        document.getElementById("search-form").action = "/stock_sentiment_universe/";

    } else {

        document.getElementById("search-form").action = "/stock_sentiment_historical/";
    }
}


