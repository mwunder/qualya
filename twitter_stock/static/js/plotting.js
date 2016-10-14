'use strict';

if(sessionStorage.DATA_INDEX) {

    $(function() {

        //local var
        var data = SCORES[sessionStorage.DATA_INDEX];


        //methods
        var createBinsData = function() {

            var bins = [ [0,0,0,0,0] ];

            for(var i=0; i<data.length; i++) { bins[0][Math.floor(2.49*(data[i]+1))] = bins[0][Math.floor(2.49*(data[i]+1))]+1 }

            for(var j=0; j<5; j++) { bins[0][j] = bins[0][j]/(data.length) }

            bins[0].unshift(sessionStorage.SYMBOL);

            return bins;
        }

        var addHistogram = function(binsData) {

            //create chart
            var chart = c3.generate({
        
                data: {  
                        columns: binsData(),
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
    });
}
