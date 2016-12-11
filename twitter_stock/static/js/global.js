'use strict';

var populateDropDownMenu = function() {

    //local var
    var all_option = document.createElement("option");

    all_option.textContent = "All";
    document.getElementById("ticker-dropdown").appendChild(all_option);

    for(var i=0; i<SYMBOLS.length; i++) {

        //loop vars
        var ticker = SYMBOLS[i],
            option = document.createElement("option");

        option.textContent = ticker;
        document.getElementById("ticker-dropdown").appendChild(option);
    }
}

