from datetime import *
from sentiment.models import *
from sentiment_refs import * 

import json
import urllib2

try: 
    import pandas.io.data as web
except:
    from pandas_datareader import data, wb
    import pandas_datareader as pdr
    import pandas_datareader.data as web

start = datetime.now() - timedelta(minutes=30*1440) # datetime(2016,1,1) # 
end = datetime.now() #(2016,10,7)

toupper = lambda s: s.upper()

# try:
#     stockDataYear = web.DataReader(map(toupper,symbols), 'google', start, end).to_frame()
# except:
#     stockDataYear = web.DataReader(map(toupper,symbols), 'yahoo', start, end).to_frame()

API_KEY = '599JJSD3VV041YHV'
URL_ACCESS = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={}&apikey=599JJSD3VV041YHV'


def pull_stock_data(symbol):
    response = urllib2.urlopen(URL_ACCESS.format(symbol))
    price_data = json.loads(response.read())["Time Series (Daily)"]
    prices = pd.DataFrame()
    for d, data in price_data.items():
        data['date'] = pd.to_datetime(d)
        for k, v in data.items():
            data[k] = [v]
        prices = pd.concat([prices, pd.DataFrame(data)])

    prices.columns = ['Open', 'High', 'Low', 'Close', 'adj', 'Volume', 'div', 'split', 'date']
    prices['symbol'] = symbol
    return prices

stockDataYear = pd.DataFrame()

for symbol in map(toupper,symbols):
    try:
        stockDataYear = pd.concat([stockDataYear, pull_stock_data(symbol)])
    except:
        print ('symbol not found: ', symbol)
        continue 

for i,row in stockDataYear.iterrows():
    # day,symbol = row.name
    day = row['date'].to_datetime()
    symbol = row['symbol']

    stock = Stock.objects.filter(symbol=symbol)
    if not stock: continue
    stock = stock[0]
    if Stock_price.objects.filter(stock=stock,trading_day=day): continue
    stock_p = Stock_price(stock=stock,trading_day=day,
        high_price = row.High,
        low_price = row.Low,
        open_price = row.Open,
        close_price = row.Close,
        volume = row.Volume)
    stock_p.save()