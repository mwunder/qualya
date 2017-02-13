'use strict';

var DEBUG_UNIVERSE = true;

/* METHODS ========================================================================================================================================*/

var addDateButtonClickEvents = function() {

    ["date-back-button", "date-forward-button"].forEach(function(button, index) {

        var inc = index == 0 ? -1 : 1;

        document.getElementById(button).onclick = function() { location.href = "/stock_sentiment_universe/?symbol=All&inc="+inc+"&date="+DATE }
    });
}


var printUniverseInfo = function() {

    //print info about the stock universe to the page
    var universe = document.createElement("p");

    universe.id = "universe";

    if(SYMBOLS.length > 0) {

        //pluralize string if necessary
        var stk = SYMBOLS.length == 1 ? ' stock' : ' stocks';

        //add text to the universe container
        universe.appendChild(document.createTextNode("The Universe contains "+SYMBOLS.length+stk+" on "+DATE+"."));

        //display sentiment bars
        document.getElementById("sentiment-bars-container").style.display = 'block';

    } else {

        universe.appendChild(document.createTextNode("Sorry, there are no stocks in the Universe on this date."));
    }

    document.getElementById("universe-container").appendChild(universe);
}


var addSentimentGraphics = function() {

    //local vars
    var width     = 500,
        height    = 125,
        cols      = ['darkred', 'rgba(255,0,0,1)', 'silver', 'rgba(0,255,0,1)', 'darkgreen'],
        textColor = 'black',
        bordBot   = '1px solid rgb(125,125,125)',
        sortedData,
        sortedBins;


    var sortData = function() {

        var obj = {};

        for(var k=0; k<SYMBOLS.length; k++) { obj[SYMBOLS[k]] = Math.pow(SCORES[k].length, 1/5) }

        var sortObj = function() {

            var data = [];

            for(var sym in obj) {

                data.push([sym, obj[sym]]);

                data.sort(function(x,y) { return y[1]-x[1] });
            }

            for(var i=1; i<data.length; i++) { data[i][1] /= data[0][1] }

            data[0][1] = 1;

            return data;
        }

        return sortObj();
    }


    var sortBins = function() {

        sortedBins = [],
        sortedData = sortData();

        for(var i=0; i<sortedData.length; i++) { sortedBins.push(BINS[SYMBOLS.indexOf(sortedData[i][0])]) }

        return sortedBins;
    }


    var filterBins = function(num) {

        var binIndices = [],
            sortedBins = sortBins();

        for(var n=0; n<sortedBins[num].length; n++) { if(sortedBins[num][n] != 0) { binIndices.push(n) } }

        return binIndices;
    }


    //responsive sentiment bar dimensions on page load; bars will not adapt if window is resized
    switch(true) {

        case window.innerWidth >= 240 && window.innerWidth < 375:
            width  = 280;
            height = 70;
            break;

        case window.innerWidth >= 375 && window.innerWidth < 475:
            width  = 320;
            height = 80;
            break;

        case window.innerWidth >= 475 && window.innerWidth < 575:
            width  = 360;
            height = 90;
            break;

        case window.innerWidth >= 575 && window.innerWidth < 700:
            width  = 400;
            height = 100;
            break;
    }

    //add sentiment bars to the page
    for(var i=0; i<SYMBOLS.length; i++) {

        //loop vars
        var wrapper    = document.createElement("div"),
            s_bar      = document.createElement("canvas"),
            context    = s_bar.getContext('2d'),
            gradient   = context.createLinearGradient(0, 0, width, 0),
            style      = s_bar.style,
            colStopTot = 0,
            indices    = filterBins(i);

        //attributes
        s_bar.id        = sortedData[i][0];
        s_bar.className = 'sentiment-bar';
        s_bar.width     = width;
        s_bar.height    = height*sortedData[i][1];
        s_bar.onclick   = sentimentBarClicked('universe', s_bar.id);

        //add color stops to the gradient
        for(var j=0; j<indices.length; j++) {

            //start color
            gradient.addColorStop(colStopTot, cols[indices[j]]);

            //update
            colStopTot += sortedBins[i][indices[j]];

            //stop color
            gradient.addColorStop(colStopTot, cols[indices[j]]);
        }

        //gradient attribute
        context.fillStyle = gradient;

        //apply gradient to the canvas
        context.fillRect(0, 0, width, height);

        //symbol text attributes
        context.fillStyle    = textColor;
        context.font         = 25*sortedData[i][1]+'px Helvetica';
        context.textAlign    = 'center';
        context.textBaseline = 'middle';

        //write symbol to the canvas 
        context.fillText(s_bar.id, width/2, height*sortedData[i][1]/2);

        //add border bottom styles
        if(i !== SYMBOLS.length-1) { style.borderBottom = bordBot }

        wrapper.appendChild(s_bar);
        document.getElementById("sentiment-bars-container").appendChild(wrapper);
    }
}

/* DEBUG METHODS ==================================================================================================================================*/

//add histogram of bins data
var addHistogram = function() {

    var chartData = {

            labels: ['0', '1', '2', '3', '4'],
            series: BINS
        },

        chartOptions = {

            width: .75*window.innerWidth,
            height: .75*window.innerHeight,
            high: 1,
            low: 0
        },

        chart = new Chartist.Bar('.ct-chart', chartData, chartOptions);
}

//hide or unhide the histogram
var toggleHistogram = function() {

    var histCont = document.getElementById("histogram-container").style;

    if(histCont.display == 'block') { histCont.display = 'none' } else { histCont.display = 'block' }
}
