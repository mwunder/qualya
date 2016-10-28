'use strict';

var DEBUG_UNIVERSE = true;


/* METHODS ========================================================================================================================================*/

var printUniverseInfo = function() {

    //print info about the stock universe to the page
    var universe = document.createElement("p");

    universe.id = "universe";

    if(SYMBOLS.length>0) {

        //pluralize string if necessary
        var stk = SYMBOLS.length == 1 ? ' stock' : ' stocks';

        universe.appendChild(document.createTextNode("On "+DATE+", the Universe contains "+SYMBOLS.length+stk+"."));

    } else {

        universe.appendChild(document.createTextNode("Sorry, there are no stocks in the Universe on this date."));
    }

    document.getElementById("universe-container").appendChild(universe);
}


var addSentimentGraphics = function() {

    //local vars
    var className = 'sentiment-bar',
        width     = 500,
        height    = 50,
        cols      = ['rgba(255,0,0,0.9)', 'rgba(255,128,0,0.9)', 'rgba(128,128,128,1)', 'rgba(255,255,0,0.9)', 'rgba(0,255,0,0.9)'],
        bordRad   = '5px';


    var filterBins = function(num) {

        var binIndicies = [];

        for(var n=0; n<BINS[num].length; n++) { if(BINS[num][n] != 0) { binIndicies.push(n) } }

        return binIndicies;
    }


    //add sentiment bars to the page
    for(var i=0; i<SYMBOLS.length; i++) {

        //loop vars
        var wrapper    = document.createElement("div"),
            s_bar      = document.createElement("canvas"),
            context    = s_bar.getContext('2d'),
            gradient   = context.createLinearGradient(0, 0, width, 0),
            indicies   = filterBins(i),
            colStopTot = 0,
            style      = s_bar.style;

        //attributes
        s_bar.id        = SYMBOLS[i];
        s_bar.className = className;
        s_bar.width     = width;
        s_bar.height    = height;
        s_bar.onclick   = (function(i) { return function() { location.href = "/stock_sentiment_historical/?symbol="+SYMBOLS[i] } }(i));

        //add color stops to the gradient
        for(var j=0; j<indicies.length; j++) {

            //start color
            gradient.addColorStop(colStopTot, cols[indicies[j]]);

            //update
            colStopTot += BINS[i][indicies[j]];

            //stop color
            gradient.addColorStop(colStopTot, cols[indicies[j]]);
        }

        //gradient attribute
        context.fillStyle = gradient;

        //apply gradient to the canvas
        context.fillRect(0, 0, width, height);

        //symbol text attributes
        context.fillStyle    = '#b3d9ff';
        context.font         = '20px Helvetica';
        context.textAlign    = 'center';
        context.textBaseline = 'middle';

        //write text to the canvas 
        context.fillText(SYMBOLS[i], width/2, height/2);

        //add border radius styles if the current bar is the first or last
        if(i == 0) {

            style.borderTopLeftRadius  = bordRad;
            style.borderTopRightRadius = bordRad;

        } else if(i == SYMBOLS.length-1) {

            style.borderBottomLeftRadius  = bordRad;
            style.borderBottomRightRadius = bordRad;
        }

        wrapper.appendChild(s_bar);
        document.getElementById("sentiment-bars-container").appendChild(wrapper);
    }
}


/* DEBUG METHODS ==================================================================================================================================*/

var generateBins = function(callback) {
    
    //create bins for the chart from DB data
    for(var i=0; i<SCORES.length; i++) {

        BINS.push([0,0,0,0,0]);

        for (var j=0; j<SCORES[i].length; j++) {

            var s = SCORES[i][j]+1;

            BINS[i][Math.floor(2.49*s)] = BINS[i][Math.floor(2.49*s)]+1;
        }

        for(var j=0; j<5; j++) { BINS[i][j] = BINS[i][j]/(SCORES[i].length) }
    }

    if(typeof callback === 'function') { callback() }
}


var addHistogram = function() {

    //add 'chartist.js' chart to the page
    var chartData = {

            labels: ['0', '1', '2', '3', '4'],

            series: BINS
        },

        chartOptions = {

            width: '1400px',

            height: '700px',

            high: 1,

            low: 0
        };

    new Chartist.Bar('.ct-chart', chartData, chartOptions);
}


var toggleHistogram = function() {

    //hide or unhide the histogram
    var histCont = document.getElementById("histogram-container").style;

    if(histCont.display == 'block') { histCont.display = 'none' } else { histCont.display = 'block' }
}

