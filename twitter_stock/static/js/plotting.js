'use strict';

$(function() {

    if(SYMBOLS.length>0) {

        //methods
        var createBinsData = function() {

            var bins = [];
      
            for(var i=0; i<SCORES.length; i++) {

                bins.push([0,0,0,0,0]);

                for (var j = 0; j<SCORES[i].length; j++) {

                    var s = SCORES[i][j]+1;

                    bins[i][Math.floor(2.49*s)] = bins[i][Math.floor(2.49*s)]+1;
                }
        
                for(var j=0; j<5; j++) { 

                    bins[i][j] = bins[i][j]/(SCORES[i].length);
                }

                bins[i].unshift(SYMBOLS[i]);
            }

            return bins;
        }


        var addHistogram = function(addBinsData) {

            //create chart
            var chart = c3.generate({
        
                data: {  
                        columns: addBinsData(),
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
        }


        //main
        addHistogram(createBinsData);
    }
});
