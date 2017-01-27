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

    //padding
    var chartPad = { top: 30, right: 45, bottom: 5, left: 15 };

    //closing prices
    var addPriceChart = function() {

        var chartData = {

                labels: createMonthDayLabels(),

                series: [ { name: 'CLOSES', data: CLOSES, className: 'closes' },
                          { name: 'MOV_CLOSES', data: MOV_CLOSES, className: 'movCloses' } ]
            },

            chartOptions = {

                series: {

                    'CLOSES': { lineSmooth: Chartist.Interpolation.none() },
                    'MOV_CLOSES': { lineSmooth: Chartist.Interpolation.monotoneCubic() }
                },

                axisX: { 

                    //determine label display
                    labelInterpolationFnc: function(value, index) {
                        
                        switch(true) {

                            case DATES.length <= 9:
                                return value;

                            //TO DO: case when 'DATES' > 145 and odd?
                            case DATES.length > 9 && DATES.length % 2 != 0:
                                switch(index) {

                                    case 0:
                                    case Math.floor((DATES.length-1)/4):
                                    case Math.floor((DATES.length-1)/2):
                                    case Math.floor(3*(DATES.length-1)/4):
                                    case DATES.length-1:
                                        return value;

                                    default:
                                        return null;
                                }

                            //TO DO: case when 'DATES' is large && even
                            default:
                                return value;
                        }
                    }
                },

                axisY: {

                    //add USD symbol to closing price labels
                    labelInterpolationFnc: function(value) { return '$' + value }
                },

                fullWidth: true,
                showPoint: false,
                chartPadding: chartPad
            },

            chart = new Chartist.Line('#price-chart', chartData, chartOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //label size
            if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '10px' }

            //re-position last x-axis label
            if (data.type === 'label' && data.axis.units.pos === 'x' && data.index == DATES.length-1) {

                data.element._node.childNodes[0].style.marginLeft = '-27px';
            }
        });
    }();

    //average sentiment
    var addSentimentChart = function() {

        var chartData = {

                labels: [],

                series: [ { name: 'AVG_SENTIMENT', data: AVG_SENTIMENT, className: 'avgSentiment' },
                          { name: 'MOV_AVG_SENTIMENT', data: MOV_AVG_SENTIMENT, className: 'movAvgSentiment' } ]
            },

            chartOptions = {

                series: {

                    'AVG_SENTIMENT': { lineSmooth: Chartist.Interpolation.none() },
                    'MOV_AVG_SENTIMENT': { lineSmooth: Chartist.Interpolation.monotoneCubic() }
                },

                axisX: {

                    showGrid: false
                },

                axisY: {

                    type: Chartist.FixedScaleAxis,
                    divisor: 9,
                    high: 1,
                    low: -1,
                    ticks: [-1, -.75, -.5, -.25, 0, .25, .5, .75, 1],
                    showGrid: false
                },

                fullWidth: true,
                showPoint: false,
                chartPadding: chartPad
            },

            chart = new Chartist.Line('#sentiment-chart', chartData, chartOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //label size
            if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '10px' }

            //position y-axis labels on right side
            if(data.type === 'label' && data.axis.units.pos === 'y') { data.element.attr({ x: data.axis.chartRect.width() + 55 }) }
        });
    }();
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
