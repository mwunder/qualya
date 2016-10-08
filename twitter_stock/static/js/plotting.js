'use strict';

$(function() {

  function generateBins(values,symbols) {
  
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
    
          bins[i].unshift(symbols[i]);
      }

      return bins;
  }


  (function generateHist(binsObj) {
  
      var chart = c3.generate({
      
          data: {  
                   columns: binsObj,
                   type:    'bar'
                },

          bar:  {  width: { ratio: 0.9 }  }
      });
  }( generateBins(scores,symbols) ));


  function loadChart() {

      $.ajax({

          url:           'http://foundationphp.com/phpclinic/podata.php?&raw&callback=?',
          jsonpCallback: 'jsonReturnData',
          dataType:      'jsonp',
          data:          { format: 'json' },

          success: function(response) {
      
              function generateChart(data) {
  
                  var chart = c3.generate({
    
                      data: {  x: 'x',
                               xFormat: '%Y-%m-%d %H:%M:%S',
                               columns: data
                            },
    
                      axis: {
                               x: {  type: 'timeseries',

                                     tick: {  format: '%m-%d %H:%M',
                                              culling: {  max: 5  }
                                           }
                                  }
                            } 
                  });
              }(processData(response));
          }
      });
  }
}); // Page Loaded
