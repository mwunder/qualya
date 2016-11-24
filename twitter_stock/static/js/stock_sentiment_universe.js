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
        height    = 125,
        cols      = ['darkred', 'rgba(255,0,0,1)', 'silver', 'rgba(0,255,0,1)', 'darkgreen'],
        bordRad   = '5px',
        bordBot   = '1px solid rgb(150,150,150)';


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


    var sortedData = sortData();

    var sortBins = function() {

        var sortedBins = [];

        for(var i=0; i<sortedData.length; i++) { sortedBins.push(BINS[SYMBOLS.indexOf(sortedData[i][0])]) }

        return sortedBins;
    }


    var sortedBins = sortBins();

    var filterBins = function(num) {

        var binIndices = [];

        for(var n=0; n<sortedBins[num].length; n++) { if(sortedBins[num][n] != 0) { binIndices.push(n) } }

        return binIndices;
    }


    //add sentiment bars to the page
    for(var i=0; i<sortedBins.length; i++) {

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
        s_bar.className = className;
        s_bar.width     = width;
        s_bar.height    = height*sortedData[i][1];
        s_bar.onclick   = (function(i) { return function() { location.href = "/stock_sentiment_historical/?symbol="+sortedData[i][0]+"&date="+DATE } }(i));

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
        context.fillStyle    = 'rgb(75,75,75)';
        context.font         = i==0 ? '30px Helvetica' : 30*sortedData[i][1]+'px Helvetica';
        context.textAlign    = 'center';
        context.textBaseline = 'middle';

        //write text to the canvas 
        context.fillText(sortedData[i][0], width/2, height*sortedData[i][1]/2);

        //add border radius and border bottom styles
        switch(i) {

            case 0:
                style.borderTopLeftRadius  = bordRad;
                style.borderTopRightRadius = bordRad;
                style.borderBottom = bordBot;
                break;

            case SYMBOLS.length-1:
                style.borderBottomLeftRadius  = bordRad;
                style.borderBottomRightRadius = bordRad;
                break;

            default:
                style.borderBottom = bordBot;
        }

        wrapper.appendChild(s_bar);
        document.getElementById("sentiment-bars-container").appendChild(wrapper);
    }
}


/* DEBUG METHODS ==================================================================================================================================*/

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

var addDateAction = function() {

    document.getElementById("date-button-form").action =  "/stock_sentiment_universe/?symbol=All&inc=-1&date=2016-09-09" ;
}


