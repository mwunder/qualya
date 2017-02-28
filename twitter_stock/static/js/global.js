'use strict';

//debug mode
var debug = function(page) {

    switch(page) {

        case 'home':
        case 'historical':
            break;

        case 'universe':
            addHistogram(); //add histogram
            document.getElementById("universe-container").onclick = toggleHistogram; //add toggle functionality
            break;
    }
}

//button logic for the sub-nav menu
var updateSubNav = function(page) {

    switch(page) {

        case 'universe':
            ["date-back-button", "date-forward-button"].forEach(function(button, index) {
                var inc = index == 0 ? -1 : 1;
                document.getElementById(button).onclick = function() { location.href = "/stock_sentiment_universe/?symbol=All&inc="+inc+"&date="+DATE }
            });
            break;

        case 'historical':
            ["zoom-out-button", "zoom-in-button"].forEach(function(button, index) {
                var w = index == 0 ? Math.round(2*TIME_FRAME,0) : Math.round(0.5*TIME_FRAME,0);
                document.getElementById(button).onclick = function() { location.href = "/stock_sentiment_historical/?symbol="+SYMBOL+"&w="+w+"&date="+DATE }
            });
            break;
    }
}

//add dropdown options
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

//click logic for the sentiment bars
var sentimentBarClicked = function(page, identifier) {

    switch(page) {

        case 'universe':
            return function() { location.href = "/stock_sentiment_historical/?symbol="+identifier+"&w=45&date="+DATE };

        case 'historical':
            return function() { location.href = "/stock_sentiment_universe/?symbol=All&date="+identifier };
    }
}

//render content
var renderContent = function(page) {

    switch(page) {

        //HOME PAGE
        case 'home':
            populateDropDownMenu("ticker-dropdown-1", SYMBOLS); //add dropdown options
            addSearchButtonClickEvent(); //search button logic
            break;

        //UNIVERSE DATA
        case 'universe':
            var universe = document.createElement("p"); //text element
            universe.id = "universe";

            if(SYMBOLS.length > 0) {
                var stk = SYMBOLS.length == 1 ? ' stock' : ' stocks'; //pluralize string if necessary
                universe.appendChild(document.createTextNode("The universe contains "+SYMBOLS.length+stk+" on "+DATE)); //add text

                updateSubNav(page); //sub-nav logic
                addSentimentGraphics(); //graphics
            } else {
                //handle date out of range
                ["date-back-button", "date-forward-button"].forEach(function(button) { document.getElementById(button).style.display = "none" }); //remove date buttons
                document.getElementById("universe-container").style.position = "static"; //position of text container
                document.getElementById("univ-sub-nav").style.height = "20px"; //sub-nav height
                universe.appendChild(document.createTextNode("Sorry, the universe is empty on "+DATE)); //add text
            }

            document.getElementById("universe-container").appendChild(universe);
            break;

        //HISTORICAL DATA
        case 'historical':
            var hist_text = document.createElement("p"); //text element
            hist_text.id = "hist-text"; //attributes
            hist_text.className = "text";
            hist_text.style.marginRight = '7px';

            if(DATES.length > 0) { 
                hist_text.appendChild(document.createTextNode(TIME_FRAME+"-day historical data for")); //add text

                var select = document.createElement("select"); //dropdown element
                select.id = "ticker-dropdown-2"; //attributes
                select.className = "dropdown";
                select.name = "symbol";
                select.tabIndex = "1";
                select.onchange = function() {
                    var selected = document.getElementById("ticker-dropdown-2").value;
                    location.href = "/stock_sentiment_historical/?symbol="+selected+"&w="+TIME_FRAME+"&date="+DATE;            
                }

                updateSubNav(page); //sub-nav logic
                addLineCharts(); //graphics
                addStackedBarChart();
            } else {
                //handle symbol, date out of range
                var remove = ["zoom-out-button", "zoom-in-button", "line-charts-container", "stacked-bar-chart-container"]; 
                remove.forEach(function(elem) { document.getElementById(elem).style.display = "none" }); //remove elements
                document.getElementById("historical-container").style.position = "static"; //position of container
                document.getElementById("hist-sub-nav").style.height = "20px"; //sub-nav height
                hist_text.appendChild(document.createTextNode("Sorry, no history for "+SYMBOL+" on "+DATE)); //add text
            }

            //append elements, add dropdown options
            document.getElementById("dropdown-container").appendChild(hist_text);

            if(select) {
                document.getElementById("dropdown-container").appendChild(select);
                populateDropDownMenu("ticker-dropdown-2", SYMBOLS);
            }
            break;
    }
}
