'use strict';

var DEBUG_UNIVERSE = true;

/* METHODS ========================================================================================================================================*/

var addIntervalButtonClickEvents = function() {

    ["zoom-in-button", "zoom-out-button"].forEach(function(button, index) {

        var w = index == 0 ? Math.round(2*timeFrame,0) : Math.round(0.5*timeFrame,0);

        document.getElementById(button).onclick = function() {

            location.href = "/stock_sentiment_historical/?symbol="+SYMBOL+"&w="+w+"&date="+DATE;
        }
    });
}

var addGoButtonClickEvent = function() {

    document.getElementById("go-button").onclick = function() {

        var selected = document.getElementById("ticker-dropdown-2").value;

        location.href = "/stock_sentiment_historical/?symbol="+selected+"&w="+timeFrame+"&date="+DATE;
    }
}

var addLineGraph = function() {

    //add 'chartist.js' chart to the page
    var chartData = {

            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],

            series: [ [12, 9, 7, 8, 5], [2, 1, 3.5, 7, 3], [1, 3, 4, 5, 6] ]
        },

        chartOptions = {

            width: 640,

            height: 480,

            axisX: {


            },

            axisY: {


            },

            showPoint: false,

            lineSmooth: Chartist.Interpolation.monotoneCubic()
        };

    var chart = new Chartist.Line('.ct-chart', chartData, chartOptions);

    //remove gridlines
    chart.on('draw', function(data) { if(data.type === 'grid' && data.index !== 0) { data.element.remove() } });
}
