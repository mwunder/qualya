'use strict';
$(function() {
  function generateBins(values,dates) {
  
      var bins = [];
      for (var i=0; i<values.length; i++) {
          bins.push([0,0,0,0,0]);

          for (var j=0; j<values[i].length; j++) {
              var v = values[i][j]+1;
              bins[i][Math.floor(2.49*v)] = bins[i][Math.floor(2.49*v)]+1;
          }
    
          for(var j=0; j<5; j++) { 
              bins[i][j] = bins[i][j]/(values[i].length);
          }
      }
      return bins;
  }

  function binsOverTime(bins,sents){
    var bin_series = [];
    for (var i=0; i<bins[0].length; i++) { bin_series.push([])} 
    // console.log(bin_series);

    for (var i=0; i<bins.length; i++) {
          for (var j=0; j<bin_series.length; j++) {
            if (j<2) {
              bin_series[j].push(-bins[i][j]); 
            }
            else {
              bin_series[j].push(bins[i][j]); 
            }
          }
      }
      for(var j=0; j<bin_series.length; j++) { 
          bin_series[j].unshift(sents[j]);
      }
      return bin_series;
  }

  function addDate(bins,dates){
    for(var j=0; j<bins.length; j++) { 
          bins[j].unshift(dates[j]);
    }
    return bins;
  }

  function normalize(values,startIndex){
    var total = 0;
    var new_values = []
    for (var i = startIndex; i<values.length; i++) {
      total+=Number(values[i]);
    }
    if (total==1) return values;
    for (var i = 0; i<values.length; i++) {
      new_values.push(Number(values[i])/total);
      // new_values[i-1] = new_values[i-1].toString();
    }
    return new_values;
  }

  function generateSentOverTime(binsObj) {
  
      var chart = c3.generate({
          data: {  
                   columns: binsObj,
                   type:    'bar',
                   groups: [['Strong neg','Weak neg','Neutral','Weak pos','Strong pos']],
                   order: 'asc'
                },
          grid: {
                  y: {
                      lines: [{value:0}]
                  }
          },
          color: {
            pattern: [ '#ff0000', '#ff7f0e', '#D3D3D3', '#98df8a', '#2ca02c']
          }
      });
  }

  var sents = ['Strong neg','Weak neg','Neutral','Weak pos','Strong pos']
  // var bins = generateBins(scores_by_date,dates);
  var bin_freqs = [];
  for (var i = 0; i<bins.length; i++) {
    bin_freqs.push(normalize(bins[i],0))
  } 
  
  var bin_series = binsOverTime(bin_freqs,sents);
  console.log(bin_freqs);
  // console.log(bin_series);
  generateSentOverTime(bin_series);
});
