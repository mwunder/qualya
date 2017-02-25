'use strict';

var debug = function(page) {

    switch(page) {

        case 'home':
            break;

        case 'universe':
            //add histogram and toggle functionality
            addHistogram();
            document.getElementById("universe-container").onclick = toggleHistogram;
            break;

        case 'historical':
            break;
    }
}

var updateSubNav = function(page) {

    switch(page) {

        case 'universe':
            //date buttons logic
            ["date-back-button", "date-forward-button"].forEach(function(button, index) {
                var inc = index == 0 ? -1 : 1;
                document.getElementById(button).onclick = function() { location.href = "/stock_sentiment_universe/?symbol=All&inc="+inc+"&date="+DATE }
            });
            break;

        case 'historical':
            //zoom buttons logic
            ["zoom-out-button", "zoom-in-button"].forEach(function(button, index) {
                var w = index == 0 ? Math.round(2*TIME_FRAME,0) : Math.round(0.5*TIME_FRAME,0);
                document.getElementById(button).onclick = function() { location.href = "/stock_sentiment_historical/?symbol="+SYMBOL+"&w="+w+"&date="+DATE }
            });
            break;
    }
}

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

        var callback = function() { if(id == "ticker-dropdown-2") { elem.value = SYMBOL } }();
    }());
}

var sentimentBarClicked = function(page, identifier) {

    switch(page) {

        case 'universe':
            return function() { location.href = "/stock_sentiment_historical/?symbol="+identifier+"&w=45&date="+DATE };

        case 'historical':
            return function() { location.href = "/stock_sentiment_universe/?symbol=All&date="+identifier };
    }
}

var renderContent = function(page) {

    switch(page) {

        case 'home':
            populateDropDownMenu("ticker-dropdown-1", SYMBOLS);
            addSearchButtonClickEvent();
            break;

        case 'universe':
            //sub-nav menu
            updateSubNav(page);

            //print universe info
            var universe = document.createElement("p");
            universe.id = "universe";

            if(SYMBOLS.length > 0) {
                var stk = SYMBOLS.length == 1 ? ' stock' : ' stocks'; //pluralize string if necessary
                universe.appendChild(document.createTextNode("The Universe contains "+SYMBOLS.length+stk+" on "+DATE)); //add text to the universe container
                document.getElementById("sentiment-bars-container").style.display = 'block'; //display sentiment bars
            } else {
                universe.appendChild(document.createTextNode("Sorry, there are no stocks in the Universe on this date"));
            }

            document.getElementById("universe-container").appendChild(universe);

            //graphics
            addSentimentGraphics();
            break;

        case 'historical':
            //sub-nav menu
            updateSubNav(page);

            if(DATES.length > 0) {
                //print historical info
                var hist_text = document.createElement("p");
                hist_text.id = "hist-text"; 
                hist_text.className = "text";
                hist_text.style.marginRight = '7px';        
                hist_text.appendChild(document.createTextNode("Historical data for"));
                document.getElementById("dropdown-container").appendChild(hist_text);

                var select = document.createElement("select");
                select.id = "ticker-dropdown-2";
                select.className = "dropdown";
                select.name = "symbol";
                select.tabIndex = "1";
                select.onchange = function() {
                    var selected = document.getElementById("ticker-dropdown-2").value;
                    location.href = "/stock_sentiment_historical/?symbol="+selected+"&w="+TIME_FRAME+"&date="+DATE;            
                }

                document.getElementById("dropdown-container").appendChild(select);
                populateDropDownMenu("ticker-dropdown-2", SYMBOLS);

                //graphics
                addLineCharts();
                addStackedBarChart();
            } else {
                console.log("this is what happens when you've got no dates to unpack...");
            }
            break;
    }
}
