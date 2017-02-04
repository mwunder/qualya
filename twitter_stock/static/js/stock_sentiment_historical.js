'use strict';

var DEBUG_UNIVERSE = true;

/* METHODS ========================================================================================================================================*/

var addIntervalButtonClickEvents = function() {

    ["zoom-out-button", "zoom-in-button"].forEach(function(button, index) {

        var w = index == 0 ? Math.round(2*TIME_FRAME,0) : Math.round(0.5*TIME_FRAME,0);

        document.getElementById(button).onclick = function() {

            location.href = "/stock_sentiment_historical/?symbol="+SYMBOL+"&w="+w+"&date="+DATE;
        }
    });
}

var addGoButtonClickEvent = function() {

    document.getElementById("go-button").onclick = function() {

        var selected = document.getElementById("ticker-dropdown-2").value;

        location.href = "/stock_sentiment_historical/?symbol="+selected+"&w="+TIME_FRAME+"&date="+DATE;
    }
}

//removes the year from all date strings
var createMonthDayLabels = function() {

    var obj = [];

    for(var i=0; i<TIME_FRAME; i++) {

        var splitDate = DATES[i].split("-");

        obj[i] = splitDate[1]+"-"+splitDate[2];
    }

    return obj;
}

//LINE CHARTS
var addLineCharts = function() {

    //responsive line chart options 
    var responsiveOptions = [

            [ 'screen and (min-width: 240px)', { chartPadding: { top: 0, right: 0, bottom: 0, left: 0 } }    ],
            [ 'screen and (min-width: 375px)', { chartPadding: { top: 23, right: 43, bottom: 3, left: 12 } } ],
            [ 'screen and (min-width: 475px)', { chartPadding: { top: 30, right: 45, bottom: 5, left: 15 } } ]
        ];

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

                    //responsive x-axis label display
                    labelInterpolationFnc: function(value, index) {

                        switch(true) {

                            //small # of dates
                            case TIME_FRAME <= 8:
                                return value;

                            //large # of dates
                            default:
                                if(TIME_FRAME % 2 != 0) {
                                    //odd # of dates
                                    switch(index) {
                                        case 0:
                                        case Math.floor(TIME_FRAME/4):
                                        case 2*(TIME_FRAME-1)/4:
                                        case Math.floor(3*TIME_FRAME/4):
                                        case TIME_FRAME-1:
                                            return value;

                                        default:
                                            return null;
                                    }
                                } else {
                                    //even # of dates
                                    switch(index) {
                                        case 0:
                                        case Math.floor((TIME_FRAME-1)/3):
                                        case Math.floor(2*TIME_FRAME/3):
                                        case TIME_FRAME-1:
                                            return value;

                                        default:
                                            return null;
                                    }                        
                                }
                        }
                    }
                },

                axisY: {

                    //add USD symbol to closing price labels
                    labelInterpolationFnc: function(value) { return '$' + value }
                },

                fullWidth: true,
                showPoint: false
            },

            chart = new Chartist.Line('#price-chart', chartData, chartOptions, responsiveOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //label size
            if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '10px' }

            //re-position last x-axis label
            if (data.type === 'label' && data.axis.units.pos === 'x' && data.index == TIME_FRAME-1) {

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
                showPoint: false
            },

            chart = new Chartist.Line('#sentiment-chart', chartData, chartOptions, responsiveOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //label size
            if (data.type === 'label') { data.element._node.childNodes[0].style.fontSize = '10px' }

            //position y-axis labels on right side
            if(data.type === 'label' && data.axis.units.pos === 'y') { data.element.attr({ x: data.axis.chartRect.width()+55 }) }
        });
    }();
}

//STACKED BAR CHART
var addStackedBarChart = function() {

    //creates a bins object
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

            axisX: {

                showLabel: false
            },

            axisY: {

                showGrid: false
            },

            stackBars: true,
            horizontalBars: true,
            chartPadding: { top: 7, right: 10, bottom: -13, left: null }
        },

        chart = new Chartist.Bar('#stacked-bar-chart', chartData, chartOptions);

    //specify more options before the chart is displayed 
    chart.on('draw', function(data) {

        //responsive stacked bar width
        if(data.type === 'bar') { data.element.attr({ style: 'stroke-width: '+Math.floor(800/TIME_FRAME)+'px' }) }

        //responsive label size
        if (data.type === 'label') {

            switch(true) {

                case TIME_FRAME <= 30:
                    data.element._node.childNodes[0].style.fontSize = '14px';
                    break;

                case TIME_FRAME > 30 && TIME_FRAME <= 50:
                    data.element._node.childNodes[0].style.fontSize = '11px';
                    break;

                case TIME_FRAME > 50 && TIME_FRAME <= 80:
                    data.element._node.childNodes[0].style.fontSize = '9px';
                    break;

                case TIME_FRAME > 80 && TIME_FRAME <= 120:
                    data.element._node.childNodes[0].style.fontSize = '7px';
                    break;

                default:
                    data.element._node.childNodes[0].style.fontSize = '5px';
                    break;
            }
        }

        //remove gridlines
        if(data.type === 'grid' && data.index !== 0) { data.element.remove() }
    });

    //responsive chart padding
    switch(true) {

        case TIME_FRAME <= 30:
            chart.update(null, {chartPadding: { left: 10 }}, true);
            break;

        case TIME_FRAME > 30 && TIME_FRAME <= 50:
            chart.update(null, {chartPadding: { left: 5 }}, true);
            break;

        default:
            chart.update(null, {chartPadding: { left: 0 }}, true);
            break;
    }
}
