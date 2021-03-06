'use strict';

var DEBUG = true;

/* METHODS ========================================================================================================================================*/

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
    var responsiveOptions = [ [ 'screen and (min-width: 240px)', { chartPadding: { top: 22, right: 28, bottom: 0, left: 2  } } ],
                              [ 'screen and (min-width: 375px)', { chartPadding: { top: 24, right: 33, bottom: 0, left: 4  } } ],
                              [ 'screen and (min-width: 475px)', { chartPadding: { top: 30, right: 45, bottom: 5, left: 15 } } ] ];

    //closing prices
    var addPriceChart = function() {

        var chartData = {

                labels: createMonthDayLabels(),

                series: [ { name: 'CLOSES',     data: CLOSES,     className: 'closes'    },
                          { name: 'MOV_CLOSES', data: MOV_CLOSES, className: 'movCloses' } ]
            },

            chartOptions = {

                series: {

                    'CLOSES':     { lineSmooth: Chartist.Interpolation.none() },
                    'MOV_CLOSES': { lineSmooth: Chartist.Interpolation.monotoneCubic() }
                },

                axisX: { 

                    //responsive x-axis gridline and label display
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

            //responsive label size, last x-axis label position
            if (data.type === 'label') {

                //screen widths of 475 pixels or greater
                if(window.matchMedia("(min-width: 475px)").matches) {

                    data.element._node.childNodes[0].style.fontSize = '10px';
                    if(data.axis.units.pos === 'x' && data.index == TIME_FRAME-1) { data.element._node.childNodes[0].style.marginLeft = '-27px' }

                //all other smaller screens
                } else {

                    data.element._node.childNodes[0].style.fontSize = '7px';
                    if(data.axis.units.pos === 'x' && data.index == TIME_FRAME-1) { data.element._node.childNodes[0].style.marginLeft = '-18px' }
                }
            }
        });
    }();

    //average sentiment
    var addSentimentChart = function() {

        var chartData = {

                labels: [],

                series: [ { name: 'AVG_SENTIMENT',     data: AVG_SENTIMENT,     className: 'avgSentiment'    },
                          { name: 'MOV_AVG_SENTIMENT', data: MOV_AVG_SENTIMENT, className: 'movAvgSentiment' } ]
            },

            chartOptions = {

                series: {

                    'AVG_SENTIMENT':     { lineSmooth: Chartist.Interpolation.none() },
                    'MOV_AVG_SENTIMENT': { lineSmooth: Chartist.Interpolation.monotoneCubic() }
                },

                axisX: {

                    showGrid: false
                },

                axisY: {

                    showGrid: false
                },

                fullWidth: true,
                showPoint: false
            },

            chart = new Chartist.Line('#sentiment-chart', chartData, chartOptions, responsiveOptions);

        //specify more options before the chart is displayed
        chart.on('draw', function(data){

            //responsive label size, right-hand side y-axis label position
            if(data.type === 'label') {

                //screen widths of 475 pixels or greater
                if(window.matchMedia("(min-width: 475px)").matches) {

                    data.element._node.childNodes[0].style.fontSize = '10px';
                    if(data.axis.units.pos === 'y') { data.element.attr({ x: data.axis.chartRect.width()+55 }) }

                //all other smaller screens
                } else {

                    data.element._node.childNodes[0].style.fontSize = '7px';
                    if(data.axis.units.pos === 'y') { data.element.attr({ x: data.axis.chartRect.width()+34 }) }
                }
            }
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

    //stacked bar width
    var barWidth = Math.floor(800/TIME_FRAME)+'px';

    //specify more options before the chart's displayed
    chart.on('draw', function(data) {

        //local vars
        var day  = DATES[data.index],
            node = data.element._node;

        if(data.type === 'bar') {

            //responsive stacked bar width, add class
            data.element.attr({ style: 'stroke-width: '+barWidth, class: 'ct-bar '+day });

            //add 'onclick' functionality
            node.onclick = sentimentBarClicked('historical', day);
        }

        //responsive label size
        if(data.type === 'label') {

            var setLabel = function() {

                var updateFont = function(size) { node.childNodes[0].style.fontSize = size+'px' }

                switch(true) {

                    case TIME_FRAME <= 30:
                        updateFont(14);
                        break;

                    case TIME_FRAME > 30 && TIME_FRAME <= 50:
                        updateFont(11);
                        break;

                    case TIME_FRAME > 50 && TIME_FRAME <= 80:
                        updateFont(9);
                        break;

                    default:
                        updateFont(7);
                        break;
                }
            }();
        }

        //remove gridlines
        if(data.type === 'grid' && data.index !== 0) { data.element.remove() }
    });

    //specify more options after the chart's been created
    chart.on('created', function() {

        //highlight stacked bars on mouseover
        var addHoverEffect = function() {

            for(var i=0; i<DATES.length; i++) {

                //keep loop variable in scope
                (function(i) {

                    var bar = Array.from(document.getElementsByClassName('ct-bar '+DATES[i]));

                    for(var j=0; j<bar.length; j++) {

                        bar[j].addEventListener('mouseover', function(e) {

                            bar.forEach(function(component) { component.setAttribute('style', 'opacity: 0.5; stroke-width: '+barWidth) });
                        });

                        bar[j].addEventListener('mouseout', function(e) {

                            bar.forEach(function(component) { component.setAttribute('style', 'opacity: 1; stroke-width: '+barWidth) });
                        });
                    }
                })(i);
            }
        }();
    });

    //responsive chart padding
    var setPadding = function() {

        var updateLeft = function(pad) { chart.update(null, {chartPadding: { left: pad }}, true) }

        switch(true) {

            case TIME_FRAME <= 30:
                updateLeft(10);
                break;

            case TIME_FRAME > 30 && TIME_FRAME <= 50:
                updateLeft(5);
                break;

            default:
                updateLeft(0);
                break;
        }
    }();
}
