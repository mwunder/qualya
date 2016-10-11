'use strict';

$(function() {

  //local var
  var data = SCORES[sessionStorage.DATA_INDEX];


  (function addHistogram(callback) {

      //create bins
      var bins = [[0,0,0,0,0]];

      for(var i=0; i<data.length; i++) { bins[0][Math.floor(2.49*(data[i]+1))] = bins[0][Math.floor(2.49*(data[i]+1))]+1 }

      for(var j=0; j<5; j++) { bins[0][j] = bins[0][j]/(data.length) }

      bins[0].unshift(sessionStorage.SYMBOL);


      callback = function() {

          //create chart
          var chart = c3.generate({
      
              data: {  
                      columns: bins,
                      type:    'bar'
                    },

              bar:  {  width: { ratio: 0.9 }  }
          });

          //generate and load chart
          $.ajax({

              url:           'http://foundationphp.com/phpclinic/podata.php?&raw&callback=?',
              jsonpCallback: 'jsonReturnData',
              dataType:      'jsonp',
              data:          { format: 'json' },

              success: function(response) {
          
                  (function generateChart(data) {

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
                  }(processData(response)));
              }
          });
      }();
  }());


  //print symbol and scores info
  [sessionStorage.SYMBOL, data].forEach(function(info) {

      var element = document.createElement('p');

      element.appendChild(document.createTextNode(info));
      element.style.textAlign = "center";

      document.getElementById("output-text-container").appendChild(element);
  });
}); // Page Loaded
