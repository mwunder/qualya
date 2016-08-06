import twitter
import twitter_refs
from datetime import *
from twitter_refs import *
from sentiment.models import *
from twitter_data_interface import *

symbols = ['$AAPL', '$GOOG','$AMZN', '$MSFT', '$FB','$NFLX' ,'$TSLA','$GS','$SPY','$QQQ']
replace_strings = ['\n','amp;','&gt;']
def rep_str(p): return lambda s: s.replace(p,'')

def construct_stock_sentiment(results):
    output = pd.DataFrame()
    for result in results:
        text = result['text']
        for rep in replace_strings:
            text = text.replace(rep,'')
        for symbol in result['entities']['symbols']:
            if symbol['text'] not in (symbols + map(rep_str('$'),symbols)): continue
            output = output.append(pd.DataFrame({'status_id':result['id'],
                'created_at': datetime_id_hour(date_record_to_date(result['created_at'])),
                'symbol':[symbol['text']],
                'status_text':[text]}))
    return output

def record_statuses(results):
    stocks = {}
    stock_count = 1
    for result in results:
            # try: 
            for sym  in result['entities']['symbols']:
                symbol = sym['text']
                if symbol not in (symbols + map(rep_str('$'),symbols)): continue            
                if symbol in stocks:
                    stock = stocks[symbol]
                else: 
                    stock = Stock.objects.filter(symbol=symbol)
                    if stock: 
                        stock = stock[0]
                        stocks[symbol] = stock
                    else:
                        stock = Stock(symbol=symbol)
                        stock.save()
                        stocks[symbol] = stock

                if Stock_status.objects.filter(status_id=result['id'],stock=stock):
                    continue
                print 'constructing status for ', stock
                text = result['text']
                for rep in replace_strings:
                    text = text.replace(rep,' ')
                stock_status = Stock_status(stock=stock,
                    symbol=symbol, 
                    status_id=result['status_id'],
                    created_at = date_record_to_hour(result['created_at']),
                    tracked_at = id_to_datetime(datetime_id_hour(datetime.now())),
                    status_text=text,
                    retweet_count = result['retweet_count'],
                    favorite_count = result['favorite_count'])
                stock_status.save()
                stock_count += 1
        # except: 
        #     continue
    return stock_count



twitter_api = oauth_login()

results = twitter_search(twitter_api,
                q= ' OR '.join(symbols), max_results=1000)

record_statuses(results)

