'use strict';

$(function() {

  /*
    function generateBins(values,dates) {
  
        var bins = [];

        for(var i=0; i<values.length; i++) {
            bins.push([0,0,0,0,0]);

            for(var j=0; j<values[i].length; j++) {
                var v = values[i][j]+1;
                bins[i][Math.floor(2.49*v)] = bins[i][Math.floor(2.49*v)]+1;
            }
      
            for(var j=0; j<5; j++) { bins[i][j] = bins[i][j]/(values[i].length) }
        }

        return bins;
    }
  */


    function binsOverTime(bins,sents){
    
        var bin_series = [];
    
        for(var i=0; i<bins[0].length; i++) { bin_series.push([]) }
    
        //console.log(bin_series);

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


    // function normalize(values,startIndex){
    
    //     var total = 0,
    //         new_values = [];
    
    //     for(var i=startIndex; i<values.length; i++) { total+=Number(values[i]) }
    
    //     if(total==1) { return values }

    //     for(var i=0; i<values.length; i++) {
      
    //         new_values.push(Number(values[i])/total);
    //         //new_values[i-1] = new_values[i-1].toString();
    //     }

    //     return new_values;
    // }

    function generateSentOverTime(binsObj) {
  
        var chart = c3.generate({

                data: {  
                        x: 'Date',
                        columns: binsObj,
                        type:    'bar',
                        types: {
                          Closing_Price: 'line',
                          Avg_sentiment: 'line',
                        },
                        axes: {
                          Strong_neg: 'y',
                          Weak_neg: 'y',
                          Neutral: 'y',
                          Weak_pos: 'y',
                          Strong_pos: 'y',
                          Closing_Price: 'y2',
                          Avg_sentiment: 'y'
                        },
                        groups: [['Strong_neg','Weak_neg','Neutral','Weak_pos','Strong_pos']],
                        order: 'asc'
                      },
                axis: {
                        x: {
                          type: 'timeseries',
                          tick: {
                            format: '%Y-%m-%d'
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
                color: { pattern: [ '#ff0000', '#FF4500', '#D3D3D3', '#98df8a', '#2ca02c', '#000000', '#ffff00'] }
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
        //bins = generateBins(scores_by_date,dates),
        // bin_freqs = [];

    // for(var i=0; i<bins.length; i++) { bin_freqs.push(normalize(bins[i],0)) }
  
    var bin_series = binsOverTime(bins,sents);
  
    console.log(bins);
    console.log(closes);
    // var prices = [];
    // for (var i=0; i<closes.length; i++) { prices[i] = closes[i] }
      
    //console.log(bin_series);
    // if (closes[0]>0){
    //   for (var i=1; i<closes.length; i++) { closes[i] = (closes[i]-closes[0])/(0.1*closes[i]) }
    //   closes[0] = 0.0;
    // }
    // console.log(closes);
    // closes.unshift('Closing_Price');
    dates.unshift('Date');
    closes.unshift('Closing_Price');
    avg_sentiment.unshift('Avg_sentiment');
    bin_series.push(closes);
    bin_series.unshift(dates);
    console.log(avg_sentiment);
    bin_series.push(avg_sentiment);
    generateSentOverTime(bin_series);

    // priceData.push(dates,prices);
    // plotPrice(priceData);
});

// CSS 
// .c3-axis-y text {
//    fill: red;
//    font-size:12px;
// }
// .c3-axis-x text {
//     font-size:12px;
//     fill:purple;
// }
