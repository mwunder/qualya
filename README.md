<a href="http://www.qualya.us">Qualya</a>
===

&nbsp; A sentiment visualizer for a subset of popular US equities and exchange-traded funds. Designed primarily as an application for the mobile web, it's also responsive to desktop and tablet devices as well.

* <a href="#about">About</a>
* <a href="#home-page">Home Page</a>
* <a href="#universe-data">Universe Data</a>
* <a href="#historical-data">Historical Data</a>

---
### <a name="about"></a>About

&nbsp; Qualya is a <a href="https://github.com/django/django">Django</a>-based application whose front-end depends on <a href="https://github.com/gionkunz/chartist-js">Chartist.js</a>.

&nbsp; Text sourced from social media forms the baseline for evaluating sentiment. Each unit of text is mapped to a number, the 'sentiment score', which lies in the interval [-1, 1]. A set of scores is generated daily for each symbol.

&nbsp; The model used to generate the scores was trained on a wide variety of tagged segments. Keyword and keyword combinations compose the features, which are then weighted by the number and position of other keywords in the input status. The ultimate feature set is selected by the ordered information content. Finally, there are several component results in the ensemble that are then synthesized into a final score. The distribution over sentiment closely matches the actual tagged data.
<br>

---
### <a name="home-page"></a>Home Page

&nbsp; Search for the latest sentiment across the universe of stocks by selecting the 'All' option from the dropdown menu. Choose any other option to view sentiment for that symbol in a historical context.

<br>
<img width="300" alt="Home Page - mobile" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVdFlTemU3ZFpoSUk">

---
### <a name="universe-data"></a>Universe Data

&nbsp; Sentiment scores are sorted into five categories: "Strongly-Negative" (crimson), "Negative" (red), "Neutral" (gray), "Positive" (light green) and "Strongly-Positive" (forest green). On December 12th, 2016, TWTR had the following sentiment profile: 24.2% "Negative", 36.4% "Neutral", 30.3% "Positive" and 9.1% "Strongly-Positive".

&nbsp; Symbols are ranked according to a smoothed function of the number of scores collected for that day. The heights of the sentiment bars vary with respect to this function to give the user a sense of the distance between rankings. TWTR must have been considerably less-mentioned than AAPL on 12-12, as it ranked only 5th of 11.

&nbsp; Touch or click the arrow buttons in the sub-navigation menu to advance backward or forward one day in time. Do the same to any bar to view historical data for that symbol. Users can also adjust the 'date' parameter in the URL directly.

<br>
<img width="300" alt="Universe Data - mobile" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVam44ZzgtZVlmMFk">

---
### <a name="historical-data"></a>Historical Data

&nbsp; The first chart plots a symbol's closing price against its average sentiment for each date in the range. Simple moving averages, whose periods are a function of the length of the lookback window, accompany each series to aid in identifying possible trends. As can be seen in the graph, TWTR's average sentiment was more volatile than its closing price over the period. Sometimes it can appear as though average sentiment leads closing price. Other times the opposite seems to be true. There are also times when no apparent relationship can be observed between the two series.

&nbsp; The second chart functions similarly to its counterpart above - touch or click a bar to view universe data for that date. However, there are two key differences: this chart spans time instead of symbols, and its sentiment bars don't reflect any measure of social media activity.

&nbsp; The default lookback window is 45 days, but this value can be halved or doubled via the magnifying glass buttons. Alternatively, the 'w' parameter in the URL can be manipulated for a greater degree of specificity. The dropdown menu allows for easy transition to historical data for other symbols in the universe. 

<br>
<img width= "300" alt="Historical Data - mobile" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVLW1Gc2RVWFQ0WlE">
