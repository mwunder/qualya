'use strict';

var populateDropDownMenu = function(id, items) {

    var elem = document.getElementById(id);

    for(var i=0; i<items.length; i++) {

        //loop vars
        var ticker = items[i],
            option = document.createElement("option");

        option.textContent = ticker;
        elem.appendChild(option);
    }

    switch(id) {

        //add 'All' option to the Home page
        case "ticker-dropdown-1":
            //local var
            var all_option = document.createElement("option");
            all_option.textContent = "All";
            elem.value = "All";
            elem.insertBefore(all_option, elem.firstChild);
            break;

        case "ticker-dropdown-2":
            elem.value = SYMBOL;
            break;
    }
}
