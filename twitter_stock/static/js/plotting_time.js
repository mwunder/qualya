'use strict';

$(function() {

    function binsOverTime(bins,sents) {
    
        var bin_series = [];
    
        for(var i=0; i<bins[0].length; i++) { bin_series.push([]) }

        for(var i=0; i<bins.length; i++) {
            for(var j=0; j<bin_series.length; j++) {
                if (j<2) {
                    bin_series[j].push(-bins[i][j]); 
                } else {
                    bin_series[j].push(bins[i][j]); 
                }
            }
        }
      
        for(var j=0; j<bin_series.length; j++) { bin_series[j].unshift(sents[j]) }

        return bin_series;
    }


    function addDate(bins,dates){

        for(var j=0; j<bins.length; j++) { bins[j].unshift(dates[j]) }

        return bins;
    }


    function generateSentOverTime(binsObj) {
  
        var chart = c3.generate({

                data: {  
                        x: 'Date',
                        columns: binsObj,
                        type:    'bar',
                        types: {
                          Closing_Price: 'line',
                          Seven_day_avg_price: 'spline',
                          Avg_sentiment: 'line',
                          Seven_day_avg_sentiment: 'spline',
                        },
                        axes: {
                          Strong_neg: 'y',
                          Weak_neg: 'y',
                          Neutral: 'y',
                          Weak_pos: 'y',
                          Strong_pos: 'y',
                          Closing_Price: 'y2',
                          Seven_day_avg_price: 'y2',
                          Avg_sentiment: 'y',
                          Seven_day_avg_sentiment: 'y'
                        },
                        groups: [['Strong_neg','Weak_neg','Neutral','Weak_pos','Strong_pos']],
                        order: null
                      },
                point: {
                        show: false
                },
                axis: {
                        x: {
                          type: 'timeseries',
                          tick: {
                            format: '%m-%d'
                          }
                        },
                        y: {
                          tick: {
                            values: [-1,-0.75,-0.5,-0.25,0,0.25,0.5,0.75,1]
                          }
                        },
                        y2: {
                          show:true
                        }
                },
                grid: { y: { lines: [{value:0}] } },
                bar: {
                        width: {
                          ratio: 0.9
                        }
                },
                color: { pattern: [ '#ff0000', '#FF4500', '#D3D3D3', '#98df8a', '#2ca02c', 'rgba(255,125,0,1)','rgba(255,125,0,0.5)', 'rgba(0,0,255,1)','rgba(0,0,255,0.3)',  '#00e5ee'] }
        });
    }


    function plotPrice(prices){
      var chart = c3.generate({
        data: {
          x: 'Date',
          columns: prices,
          type: 'line',
          groups: [
              ['Price']
          ]
        }, 
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%Y-%m-%d'
            }
          } // x
        }, // axis
        subchart: {
          show: true
        } //subchart
      });
    }

    var sents = ['Strong_neg','Weak_neg','Neutral','Weak_pos','Strong_pos'];
  
    var bin_series = binsOverTime(bins,sents);
  
    console.log(bins);
    console.log(closes);
    
    dates.unshift('Date');
    closes.unshift('Closing_Price');
    avg_sentiment.unshift('Avg_sentiment');
    moving_sentiment.unshift('Seven_day_avg_sentiment');
    moving_price.unshift('Seven_day_avg_price');
    bin_series.unshift(dates);
    bin_series.push(closes);
    bin_series.push(moving_price);
    bin_series.push(avg_sentiment);
    bin_series.push(moving_sentiment);
    console.log(avg_sentiment);
    generateSentOverTime(bin_series);
});
