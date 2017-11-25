import twitter
import twitter_refs
from datetime import *
from twitter_refs import *
from sentiment.models import *
from twitter_data_interface import *

symbols = ['$AAPL', '$GOOG','$AMZN', '$MSFT', '$FB','$NFLX' ,'$TSLA','$GOOGL','$TWTR','$GDX','$SPY','$SNAP','$BTC','$ETH','$NVDA']
symbol_dict = {'$AAPL':'apple', '$GOOGL':'google','$AMZN':'amazon', #'$QQQ':'qqq',
'$SPY':'spy',
'$MSFT':'microsoft', '$FB':'facebook','$NFLX':'netflix' ,'$TSLA':'tesla',
'$XOM':'exxon','$TWTR':'twitter','$GDX':'gdx','$SNAP':'snapchat',
'$ETH':'ethereum','$BTC':'bitcoin','$NVDA':'nvidia'}
symbol_index = dict((v,k) for k,v in symbol_dict.items())
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
    min_length = 30 
    for result in results:
        try: 
            if len(result['entities']['symbols'])>1 or len(result['text'])<min_length: continue
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

                text = result['text']
                if Stock_status.objects.filter(status_id=result['id'],stock=stock) or \
                    result['user']['id']==2669983818 or \
                    text.find('#stocks #stockmarket #investing')>0 or \
                    text.find('nlock Rate')>0 or text.find('nlocking')>0 or \
                    text.find('Video Analysis')>0:
                    continue  
                current_analyst_tweets= Stock_status.objects.filter(analyst_id=result['user']['id'],
                    created_at=date_record_to_hour(result['created_at']),
                    stock=stock)
                if current_analyst_tweets and any(t.status_text[:50] == text[:50] for t in  current_analyst_tweets):
                    continue  
                
                if text[:2] == 'RT':
                    if Stock_status.objects.filter(status_text=text,stock=stock,
                        tracked_at__gte=datetime.now()-timedelta(minutes=360)):
                        continue
                # print 'constructing status for ', stock
                for rep in replace_strings:
                    text = text.replace(rep,' ')
                stock_status = Stock_status(stock=stock,
                    symbol=symbol, 
                    status_id=result['id'],
                    analyst_id = result['user']['id'],
                    created_at = date_record_to_hour(result['created_at']),
                    tracked_at = id_to_datetime(datetime_id_hour(datetime.now())),
                    status_text=text,
                    retweet_count = result['retweet_count'],
                    favorite_count = result['favorite_count'])
                stock_status.save()
                stock_count += 1
        except: 
            continue
    return stock_count
 

twitter_api = oauth_login()

if 'results' not in locals():
    results = twitter_search(twitter_api,
                q= ' OR '.join([s for i,s in enumerate(symbols[datetime.now().hour%len(symbols):]+symbols[:datetime.now().hour%len(symbols)]) if i <10 ]),max_results=1000) #if (i%len(symbols))!=(datetime.now().hour%len(symbols)) and (i%len(symbols))!=(datetime.now().hour%len(symbols)) and ]), 
                    

record_statuses(results)

