from datetime import *
from sentiment.models import *
from sentiment_refs import * 
from crycompare import *


num_days = 60

start = datetime.now() - timedelta(minutes=num_days*1440) # datetime(2016,1,1) # 
end = datetime.now() #(2016,10,7)

toupper = lambda s: s.upper()

h = History()

df_dict = {}
for coin in ['BTC', 'ETH']:
    histo = h.histoDay(coin,'USD',allData=True)
    if histo['Data']:
        df_histo = pd.DataFrame(histo['Data'])
        df_histo['time'] = pd.to_datetime(df_histo['time'],unit='s')

        df_dict[coin] = df_histo

    for i, row in df_dict[coin].tail(num_days).iterrows():
        day = row.time.to_datetime()
        stock = Stock.objects.filter(symbol=coin)
        if not stock: continue
        stock = stock[0]
        if Stock_price.objects.filter(stock=stock,trading_day=day): 
            continue
        stock_p = Stock_price(stock=stock,trading_day=day,
            high_price = row.high,
            low_price = row.low,
            open_price = row.open,
            close_price = row.close,
            volume = (row.volumeto + row.volumefrom)/2)
        stock_p.save()

