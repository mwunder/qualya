from datetime import *
from sentiment.models import *
from sentiment_refs import * 

try: 
    import pandas.io.data as web
except:
    from pandas_datareader import data, wb
    import pandas_datareader as pdr
    import pandas_datareader.data as web

start = datetime.now() - timedelta(minutes=30*1440) # datetime(2016,1,1) # 
end = datetime.now() #(2016,10,7)

toupper = lambda s: s.upper()

try:
    stockDataYear = web.DataReader(map(toupper,symbols), 'google', start, end).to_frame()
except:
    stockDataYear = web.DataReader(map(toupper,symbols), 'yahoo', start, end).to_frame()

for i,row in stockDataYear.iterrows():
    day,symbol = row.name
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