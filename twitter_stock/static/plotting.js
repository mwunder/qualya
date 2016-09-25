$(function() {
'use strict';
var fromDate, toDate;

function getMean(myArray) {
  var mean = myArray.reduce(function(a,b) {
    return a + b;
  })/myArray.length;
  return mean.toFixed(2);
} //getMean

function getMedian(myArray) {
  var median;
  var sorted = myArray.sort(myArray);
  var middleIndex = Math.floor(sorted.length/2);

  if(sorted.length % 2 === 0) {
    var medianA = sorted[middleIndex];
    var medianB = sorted[middleIndex - 1];
    median = (medianA + medianB)/2;
  } else {
    median = sorted[middleIndex];
  }

  return median.toFixed(2);
} //getMedian

function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}

function processData(data) {
  var myData = [];

  var myDates = ['x'];
  var meanTemps = ['Mean Temperature'];
  var medTemps = ['Median Temperature'];
  var meanPress = ['Mean Pressure'];
  var medPress = ['Median Pressure'];
  var meanSpeeds = ['Mean Speed'];
  var medSpeeds = ['Median Speed'];

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if ((data[key].t !== null) 
        && (data[key].p !== null) 
        && (data[key].s !== null)) {
        myDates.push(key);
        meanTemps.push(getMean(data[key].t));
        medTemps.push(getMedian(data[key].t));
        meanPress.push(getMean(data[key].p));
        medPress.push(getMedian(data[key].p));
        meanSpeeds.push(getMean(data[key].s));
        medSpeeds.push(getMedian(data[key].s));
      } //data is not null
    } // hasOwnProperty
  } // for key in data

  myData.push(myDates, meanTemps, medTemps, meanPress, medSpeeds, meanSpeeds);
  return myData;
} // Process Data

function generateChart(data) {
  var chart = c3.generate({
    data: {
      x: 'x',
      xFormat: '%Y-%m-%d %H:%M:%S',
      columns: data,
      //type: 'bar',
      //groups: [
      //['Mean Temperature','Median Temperature',
      //      'Mean Pressure','Median Pressure',
      //      'Mean Speed', 'Median Speed']
       //   ['Frequency','Smoothed frequency']
      //],
      //type:'line'
    },
    // bar: {
    //   width: {
    //     ratio: 0.9
    //   }
    // },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%m-%d %H:%M',
          culling: {
            max:5
          }
        },
      } // x
    } // axis
    // subchart: {
    //   show: true
    // } //subchart
  }); // chart
} // generateChart

function generateHist(data) {
  var chart = c3.generate({
    data: {
      // x: 'x',
      columns: [data],
      type: 'bar',
    },
    bar: {
      width: {
        ratio: 0.9
      }
    },
    // subchart: {
    //   show: true
    // } //subchart
  }); // chart
} // generateChart


function loadChart() {
  $.ajax({
    url: 'http://foundationphp.com/phpclinic/podata.php?&raw&callback=?',
    jsonpCallback: 'jsonReturnData',
    dataType: 'jsonp',
    data: {
      startDate: formatDate(fromDate, ''),
      endDate: formatDate(toDate, ''),
      format: 'json'
    },
    success: function(response) {
      generateChart(processData(response));
    } //success

  }); //AJAX Call
} //load Chart

function formatDate(date, divider) {
  var someday = new Date(date);
  var month = someday.getUTCMonth() + 1;
  var day = someday.getUTCDate();
  var year = someday.getUTCFullYear();

  if (month <= 9) { month = '0' + month; }
  if (day <= 9) { day = '0' + day; }

  return ('' + year + divider + month + divider + day);
}

// // Events ------
function std(values,mu) {
  var sum = values.reduce(function(prev,curr) {
    return +Math.pow(curr-mu,2)+prev
  },0 ); 
  return Math.pow(sum,0.5);
}

function avg_deviation(times,values,mu){
  var dev = 0;
  for (var i = 0; i < values.length; i++) { 
    dev +=  Math.abs(i-mu)*Number(values[i]);
  }  
  return dev;
}

function weighted_median(values){
  var cumsum = 0;
  for (var i = 1; i<values.length; i++) {
    cumsum+=Number(values[i]);
    if (cumsum>0.5) 
      return i-1
  }
  return i;
}

function normalize(values,startIndex){
  var total = 0;
  var new_values = []
  for (var i = startIndex; i<values.length; i++) {
    total+=Number(values[i]);
  }
  if (total==1) return values;
  for (var i = 1; i<values.length; i++) {
    new_values.push(Number(values[i])/total);
    new_values[i-1] = new_values[i-1].toString();
  }
  return new_values;
}

function computeEDist(values,normalized) {
  var mu = 0;
  var b = 0;
  var times = [];
  var EDists = [];
  // for (var i = 1; i < values.length; i++) { 
  //   mu += values[i]*(i-1);
  //   times.push(i-1);
  // }
  //values = normalize(values,1);
  mu = weighted_median(values);
  b = avg_deviation(times,values.slice(1),mu);
  console.log(b);
  console.log(mu);
  for (var i = 0; i<values.length-1; i++) {
    EDists.push(Math.exp(-Math.abs(i-mu)/b)/(2*b));
  }
  if (normalized) {
    EDists = normalize(EDists,0);
  }
  return EDists;
}

function hist(values) {
  var bins = [0,0,0,0,0] 
  for (var i = 0; i<values.length-1; i++) {
    var v =  values[i]+1;
    // console.log(Math.floor(2.5*v));
    bins[Math.floor(2.5*v)] = bins[Math.floor(2.5*v)]+1;
  }
  for  (var i = 0; i<bins.length; i++) { 
    bins[i] = bins[i]/(1.0*values.length)
  }
  return bins;
}

document.forms.rangeform.addEventListener('change', function(e) {
  fromDate = new Date(document.rangeform.from.value);
  toDate = new Date(document.rangeform.to.value);
  if (Date.parse(toDate)==0 | !isValidDate(toDate)) {
    toDate = new Date();
  }
  if (Date.parse(fromDate)==0 | !isValidDate(fromDate)) {
    fromDate = new Date(myData[0][1]);
  }
  var dates = myData[0];
  var values =myData[1];
  var EDists = myData[2];
  var keep_dates = [dates[0]];
  var keep_values = [values[0]];
  for (var i = 1; i < dates.length; i++) { 
    if (Date.parse(dates[i])>=fromDate & Date.parse(dates[i])<=toDate ) {
      keep_dates.push(dates[i]);
      keep_values.push(values[i]);
      //keep_EDists.push(EDists[i]);
    }
  }
  var keep_EDists = computeEDist(keep_values,true);
  keep_EDists.unshift(EDists[0]);
  var thisData = [keep_dates,keep_values,keep_EDists]; 
  generateChart(thisData);
}, false);

//set up

// fromDate = new Date();
// fromDate.setDate(fromDate.getDate() - 31);

// toDate = new Date();
// toDate.setDate(toDate.getDate() - 1);

// document.forms.rangeform.from.value = formatDate(fromDate, '-');
// document.forms.rangeform.to.value = formatDate(toDate, '-');

// loadChart();

// var norm_values = normalize(freqs,1);
// norm_values.unshift('Normalized');
// myData.push(norm_values);
// var keep_EDists = computeEDist(norm_values,false);
// keep_EDists.unshift(EDist[0]);
// myData[2] = keep_EDists;

// console.log(myData);
// generateChart(myData);

var myData = hist(scores);
myData.unshift('aapl');
console.log(myData);
generateHist(myData);

//var md = {d:dates}

}); // Page Loaded