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

//removes the year from all date strings
var createMonthDayLabels = function() {

    var obj = [];

    for(var i=0; i<DATES.length; i++) {

        var splitDate = DATES[i].split("-");

        obj[i] = splitDate[1]+"-"+splitDate[2];
    }

    return obj;
}

var addLineCharts = function() {

    var addPriceChart = function() {

        var chartData = {

                labels: createMonthDayLabels(),

                series: [
                          { name: 'CLOSES', data: CLOSES },
                          { name: 'MOV_CLOSES', data: MOV_CLOSES }
                        ]
            },

            chartOptions = {

                series: {

                    'CLOSES': { lineSmooth: Chartist.Interpolation.none() },
                    'MOV_CLOSES': { lineSmooth: Chartist.Interpolation.monotoneCubic() }
                },

                axisX: {

                },

                axisY: {

                    labelInterpolationFnc: function(value) { return '$' + value }
                },

                fullWidth: true,
                showPoint: false,

                chartPadding: {
                    top: 15,
                    right: 30,
                    bottom: 15,
                    left: 15
                }
            },

            chart = new Chartist.Line('#line-charts', chartData, chartOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //label size
            if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '11px' }
        });
    }();

    /*
    var addSentimentChart = function() {

        var chartData = {

                labels: [],

                series: [

                        ]
            },

            chartOptions = {

                axisX: {

                },

                axisY: {

                },

                fullWidth: true,
                showPoint: false,

                chartPadding: {
                    top: 15,
                    right: 30,
                    bottom: 15,
                    left: 15
                }
            },

            chart = new Chartist.Line('#line-charts', chartData, chartOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //label size
            if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '11px' }
        });
    }();
    */
}

var addStackedBarChart = function() {

    //creates a stacked bar chart bins object
    var createStackedBarBins = function() {
    
        var obj = [];
    
        for(var i=0; i<BINS[0].length; i++) { obj.push([]) }

        for(var i=0; i<BINS.length; i++) {

            for(var j=0; j<obj.length; j++) { obj[j].push(BINS[i][j]) }
        }

        return obj;
    }
    
    //specify chart data and options, create chart object
    var chartData = {

            labels: createMonthDayLabels(),
            series: createStackedBarBins()
        },

        chartOptions = {

            stackBars: true,
            horizontalBars: true,

            axisX: {

                showLabel: false
            },

            axisY: {

                showGrid: false
            }
        },

        chart = new Chartist.Bar('#stacked-bar-chart', chartData, chartOptions);

    //specify more options before the chart is displayed 
    chart.on('draw', function(data) {

        //remove gridlines
        if(data.type === 'grid' && data.index !== 0) { data.element.remove() }

        //stacked bar width
        if(data.type === 'bar') { data.element.attr({style: 'stroke-width: 125px'}) }

        //label size
        if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '14px' }
    });
}
