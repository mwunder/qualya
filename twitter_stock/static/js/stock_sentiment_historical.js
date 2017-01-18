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

var addStackedBarChart = function() {

    //add 'chartist.js' stacked bar chart to the page
    var chartData = {

            labels: ['Q1', 'Q2', 'Q3', 'Q4'],

            series: [  [800000, 1200000, 1400000, 1300000],
                       [200000,  400000,  500000,  300000],
                       [100000,  200000,  400000,  600000],
                       [100000,  200000,  400000,  600000],
                       [200000,  400000,  500000,  300000]  ]
        },

        chartOptions = {

            width: 640,

            height: 480,

            stackBars: true,

            axisX: {

                labelInterpolationFnc: function(value) { return }
            },

            axisY: {


            },

            //showPoint: false,

            //lineSmooth: Chartist.Interpolation.monotoneCubic()
        };

    var chart = new Chartist.Bar('.ct-chart', chartData, chartOptions);

    //more chart options
    chart.on('draw', function(data) {

        ////remove gridlines
        if(data.type === 'grid' && data.index !== 0) { data.element.remove() }

        //set stacked bar width
        if(data.type === 'bar') { data.element.attr({style: 'stroke-width: 100px'}) }
    });
}
