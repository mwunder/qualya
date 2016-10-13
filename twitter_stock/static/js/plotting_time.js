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

  function generateSentOverTime(binsObj) {
  
      var chart = c3.generate({
          data: {  
                   columns: binsObj,
                   type:    'bar',
                   groups: [['Strong neg','Weak neg','Neutral','Weak pos','Strong pos']]
                },
          grid: {
                  y: {
                      lines: [{value:0}]
                  }
          }
      });
  }

  var sents = ['Strong neg','Weak neg','Neutral','Weak pos','Strong pos']
  var bins = generateBins(scores_by_date,dates);
  var bin_series = binsOverTime(bins,sents);
  // console.log(bins);
  // console.log(bin_series);
  generateSentOverTime(bin_series);



    //     //local var
    //     var data = SCORES[sessionStorage.DATA_INDEX];

    //     (function addHistogram(callback) {

    //         //create bins
    //         var bins = [ [0,0,0,0,0] ];

    //         for(var i=0; i<data.length; i++) { bins[0][Math.floor(2.49*(data[i]+1))] = bins[0][Math.floor(2.49*(data[i]+1))]+1 }

    //         for(var j=0; j<5; j++) { bins[0][j] = bins[0][j]/(data.length) }

    //         bins[0].unshift(sessionStorage.SYMBOL);


    //         callback = function() {

    //             //create chart
    //             var chart = c3.generate({
            
    //                 data: {  
    //                         x:       dates, 
    //                         columns: bins,
    //                         type:    'bar'
    //                       },

    //                 bar:  {  width: { ratio: 0.9 }  }
    //             });

    //             //generate and load chart
    //             $.ajax({

    //                 url:           'http://foundationphp.com/phpclinic/podata.php?&raw&callback=?',
    //                 jsonpCallback: 'jsonReturnData',
    //                 dataType:      'jsonp',
    //                 data:          { format: 'json' },

    //                 success: function(response) {
                
    //                     (function generateChart(data) {

    //                         var chart = c3.generate({

    //                             data: {  x: 'x',
    //                                      xFormat: '%Y-%m-%d %H:%M:%S',
    //                                      columns: data
    //                                   },

    //                             axis: {
    //                                      x: {  type: 'timeseries',

    //                                            tick: {  format: '%m-%d %H:%M',
    //                                                     culling: {  max: 5  }
    //                                                  }
    //                                         }
    //                                   } 
    //                         });
    //                     }(processData(response)));
    //                 }
    //             });
    //         }();
    //     }());


    //     //print symbol and scores info to the page, clear sessionStorage
    //     [sessionStorage.SYMBOL, data].forEach(function(info, callback) {

    //         var element = document.createElement('p');

    //         element.appendChild(document.createTextNode(info));
    //         element.style.textAlign = "center";
    //         document.getElementById("output-text-container").appendChild(element);

    //         callback = function() {

    //             sessionStorage.removeItem('SYMBOL');
    //             sessionStorage.removeItem('DATA_INDEX');
    //         }();
    //     });
    // });
});
