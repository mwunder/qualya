'use strict';

var populateDropDownMenu = function(id, items) {

    //local var
    var elem = document.getElementById(id);

    //add 'All' option to the Home page
    if(id == "ticker-dropdown-1") {

        //local var
        var all_option = document.createElement("option");

        all_option.textContent = "All";
        elem.appendChild(all_option);
    }

    (function(callback) {

        for(var i=0; i<items.length; i++) {

            //loop vars
            var ticker = items[i],
                option = document.createElement("option");

            option.textContent = ticker;
            elem.appendChild(option);
        }

        var callback = function() {

            if(id == "ticker-dropdown-2") { elem.value = SYMBOL }
        }();
    }());
}

var sentimentBarClicked = function(page, identifier) {

    switch(page) {

        case 'universe':
            return function() { location.href = "/stock_sentiment_historical/?symbol="+identifier+"&w=45&date="+DATE };

        case 'historical':
            //TO DO
            return;
    }
}
