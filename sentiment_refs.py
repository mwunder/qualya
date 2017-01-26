from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import twitter_refs
from twitter_refs import *
import numpy as np 
import pandas as pd
from nltk.stem import *
from collections import Counter, defaultdict

st = SnowballStemmer("english")

symbol_dict = {'$AAPL':'apple', '$GOOGL':'alphabet', '$GOOG':'google','$AMZN':'amazon', 
'$MSFT':'microsoft', '$FB':'facebook','$NFLX':'netflix' ,'$TSLA':'tesla','$QQQ':'qqq',
'$GS':'goldman','$TWTR':'twitter','$XOM':'exxon','$SPY':'spy','$GDX':'gdx','$WMT':'walmart'}
symbols = [k[1:].lower() for k in symbol_dict.keys()]
symbol_index = dict((v,k) for k,v in symbol_dict.items())
replace_strings = dict(zip(['\n','amp;','&gt;', '$'],[' ']*100))
replace_strings.update({',':' , ','[\?]+':' ??? ','.':' . ',':':' : ', "=":" = ", '!': ' !!! ',
    "-":" - ", '\(':' ( ','\)': ' ) ', '\\':' ',
    #' not ':' not_',"n't ":' not_',  ' no ':' noo ',
    " not | never |n't | no | noo ":' negation_word ',
    'googl':'goog',' #theral':' theral',
    '^rt @[a-zA-Z]+: ':'',
    ' \#([a-z]+) ' : r' #\1 \1 ' ,
    ' up ':' upp ','rbc':' institution_name ','vetr':' institution_name '})

replace_pairs= {'sold out':'sold_out', 'break out':'breakout' , 'all[ -]time':'all_time_', 
'william blair':'institution_name','short.term':'short_term',
'hedge fund':' institution_name ', '(elon|musk|elon musk)':'elon_musk',
'[sS]hort.[sS]queeze':'shortsqueeze','[sS]queeze.[sS]hort':'shortsqueeze',
'adfn investorshub':'institution_name', 'message board': 'institution_name',
'jpmorgan':'institution_name'}

stopwords.add('num_string')
stopwords.add('hyperlink')
stopwords = stopwords | set(['could','would','should','may','still','one','via',
    "it's","i'm","i'm","that's,"\
    'month', 'year','hour', 'day','week','today' , 'gliimpse', \
    "here's",'get','well','make', 'much','many','getting','going','must','maybe'\
    'see','look','looks','looking','says','let', 'think','need', \
    'maturity','stock','stocks','#stocks','shares','trade','trades',
    'nfl','#nfl','nhl','nba','#nhl','tnf','#tnf','footbal','football',
    'inc', 'llc','spi']) # , 'institution_name', 't_handle'])

days_of_week = ['monday','sunday','tuesday','wednesday','thursday','friday','saturday','tues','weds','thurs']
months = [ 'oct', 'sep','aug','nov','dec','jan','feb','march','april','jun','june','july','jul',
            'august','september','october','november','december','january','february']

stopwords = stopwords | set(days_of_week) | set(months)
stopwords = stopwords - set(['not','never','out',"n't",'no','noo','down'])
stopwords = stopwords | (set(map(st.stem,list(stopwords))) | stopwords)

def unindex(dictionary): return lambda words : [dictionary[w] for w in words if w in dictionary]
def keep_members(dictionary): return lambda words : set(words) & set( dictionary.keys())
def memberof(item): return lambda s : 0 if not s else (item in s)
def rep_str(p): return lambda s: s.replace(p,'')
def kw_index(d): return lambda kws : [(d[w] if w in d else 0) for w in kws]
def round_decs(d): return lambda x: round(x*10**d)/(10**d)
def trunc_str(k): return lambda s: s[:k]
def apply_cutoffs(upper_b=1,lower_b=0): return lambda x : min(upper_b,max(lower_b,x))

def remove_encodings(s) : 
    try: 
        s.encode('ascii','ignore')
        return True
    except:
        return False
    return False

def find_symbol(row):  
    try: return (row['symbol'] in row['status_text'])
    except:  
        return False

def series_union(c1,c2): return lambda row:  row[c1] | row[c2]

def rsquared(prediction,target): return 1.0- sum((prediction-target)**2) / sum((np.mean(target)-target)**2) 

def sign (t,x): return 1*(x>t) - 1*(x<-t)
def logistic (x) : return 1/(1+np.exp(-x))


def stems(words): 
    return [st.stem(w) for w in words]

def logistic_optimization(X,Y,niter=10000):
    w = np.random.randn(X.shape[1])/10.0
    intercept = 0.1
    lrate = 0.01
    threshold = 0.01
    for i in xrange(niter):
        errs = Y - logistic(X.dot(w) + intercept)
        w +=  lrate*errs.dot(X)/X.shape[0]
        intercept += lrate*np.mean(errs)        
        # w +=  lrate*sign(threshold,errs).dot(X)/X.shape[0]
        # intercept += lrate*np.mean(sign(threshold,errs))
        if not i%(niter/10): 
            lrate *= 0.9
            # print sum(np.abs(errs)**2)
    return w,intercept

def normalize(P) :     return P if sum(P)<=1  else P/(1.0*sum(P))

def kl_divergence(P,Q):
    if len(P)!=len(Q):  return -1
    if sum(P)>1:        P = (P+0.1)/(1.0*sum(P+0.1))
    if sum(Q)>1:        Q = (Q+0.1)/(1.0*sum(Q+0.1))
    return sum(p*np.log(p/q) for p,q in zip(P,Q) if p)

# def construct_stock_sentiment(results):
#     output = pd.DataFrame()
#     replace_strings = ['\n','amp;']
#     for result in results:
#         text = result['text']
#         for rep in replace_strings:
#             text = text.replace(rep,'')
#         for symbol in result['entities']['symbols']:
#             if symbol['text'] not in (stocks + map(rep_str('$'),stocks)): continue
#             output = output.append(pd.DataFrame({'status_id':result['id'],
#                 'created_at': datetime_id_hour(date_record_to_date(result['created_at'])),
#                 'symbol':[symbol['text']],
#                 'status_text':[text]}))
#     return output

def logistic_predict(X,w,intercept):    return logistic(X.dot(w)+intercept)
def logistic_error(X,Y,w,intercept):    return Y-logistic_predict(X,w,intercept)

def next_word(word,words,window_limit = 5): 
    if not word or not words: return 0
    pos = words.index(word)
    for i, w in enumerate(words[pos+1:pos+window_limit]):
        if not w: continue
        return words[i+1]
    return 0 

def max_pain_diff(status,return_threshold = 0.05):
    status = status.lower()
    if status.find('max pain')<0 and re.search('max pain[^0-9]{3,5}([0-9]+\.[0-9]+)', status): return 0 
    try:    max_pain = float(re.search('max pain[^0-9]{3,5}([0-9]+\.[0-9]+)', status).group(1))
    except: return 0 
    if status.find(' price ')<0 and status.find(' close ')<0: 
        return 0
    try: 
        if status.find(' price ')>=0:
            price = float(re.search('price[^0-9]{3,5}([0-9]+\.[0-9]+)', status).group(1))
        else:
            price = float(re.search('close[^0-9]{3,5}([0-9]+\.[0-9]+)', status).group(1))
        return max(-1,min(1,1.0/return_threshold*(max_pain-price)/price))
    except:    return 0

def putcallratio(status):
    status = status.lower()
    if status.find('putcallratio')<0: 
        return 0 
    try: 
        putcallratio = float(re.search('putcallratio=([0-9]+\.[0-9]+)', status).group(1))
        return logistic(1-putcallratio)
    except:    return 0

def process_prices(price_file='stock_prices.csv'):
    prices = pd.read_csv(price_file)
    prices['price_return'] = 0
    prices['trading_day'] = pd.to_datetime(prices['trading_day']).apply(datetime.date)
    prices = prices.sort(['symbol','trading_day'])
    for i,row in prices.iterrows():
        if not i or prices.ix[i-1,'symbol']!=row['symbol']: continue
        #last_price = prices.ix[i-1,:]
        last_price = prices[(prices.symbol==row['symbol'])&(prices.trading_day==row['trading_day']-timedelta(minutes=1440))]
        if last_price.empty:
            last_price = prices[(prices.symbol==row['symbol'])&(prices.trading_day==row['trading_day']-timedelta(minutes=3*1440))]
        if last_price.empty:
            last_price = prices[(prices.symbol==row['symbol'])&(prices.trading_day==row['trading_day']-timedelta(minutes=4*1440))]
        if last_price.empty: 
            # print symbol ,prices.trading_day
            # print prices[(prices.trading_day==row['trading_day']-timedelta(minutes=4*1440))]
            continue
        if last_price.shape[0]>1:
            print(last_price.shape )
        last_price = last_price.ix[last_price.index[0],:]
        # print last_price,row
        prices.loc[i,'price_return'] = (row.close-last_price.close)/last_price.close
    prices['symbol'] = prices.symbol.apply(tolower)    
    return prices 

def replace_status_with_signal(status):
    status_text = status['status_text'].lower()
    symbol =  ' $'+ status['symbol'].lower() +' '
    maxP = max_pain_diff(status_text)
    if maxP:
        return symbol + \
        ( 'strong_neg_signal'  if maxP<= -1 else 
        'weak_neg_signal' if maxP<= -0.25 else
        'neutral_signal' if maxP<0.25 else
        'weak_pos_signal' if maxP<1 else
        'strong_pos_signal' )

    pcratio = putcallratio(status_text)
    if pcratio==0: 
        return status_text
    return symbol +\
        ( 'strong_neg_signal'  if pcratio<0.25 else 
        'weak_neg_signal' if pcratio<0.45 else
        'neutral_signal' if maxP<0.55 else
        'weak_pos_signal' if maxP<0.75 else
        'strong_pos_signal' )
    # if pcratio<0.25: return 'strong_neg_signal'
    # elif pcratio<0.45: return 'weak_neg_signal'
    # elif maxP<0.55: return 'neutral_signal'
    # elif pcratio<0.75: return 'weak_pos_signal'
    # else: return 'strong_pos_signal'
    return status_text

def status_preprocessing(stocks,use_negations=0):
    stocks['status_text'] = stocks['status_text'].str.replace('[A-Z][a-z]{4,12} [lL][lL][cC]\.?',' Institution_name ')
    stocks['status_text'] = stocks['status_text'].str.replace('[A-Z][a-z]{4,12} [iI][n][c]\.?',' Institution_name ')
    stocks['status_text'] = stocks['status_text'].str.replace('RBC [A-Z][a-z]{4,12}',' Institution_name ')
    stocks['status_text'] = stocks['status_text'].str.replace(' [A-Z][a-z]{4,12} {1,2}[A-Z][a-z]{4,12} ',' institution_name ')
    stocks['status_text'] = stocks['status_text'].str.lower()
    # stocks['status_text'] = stocks.apply(replace_status_with_signal,axis=1)
    stocks['status_text'] = stocks['status_text'].str.replace('https?://.{4,15} ?','  hyperlink ')
    stocks['status_text'] = stocks['status_text'].str.replace('@[a-z_]{3,15} ','  t_handle ')
    stocks['status_text'] = stocks['status_text'].str.replace('\$[0-9]{1,3}[^,]',' num_price ') 
    stocks['status_text'] = stocks['status_text'].str.replace('\$[0-9,]+',' num_cash ') 
    stocks['status_text'] = stocks['status_text'].str.replace('[0-9]+','       num_string ') 

    for p,r in replace_pairs.items() + replace_strings.items() : #symbol_index.items()+
        stocks['status_text'] = stocks['status_text'].str.replace(p,r.lower())
    for sym in symbols:
        stocks['status_text'] = stocks['status_text'].str.replace(sym,' '+sym+' ')
    for sym,stock_name in symbol_dict.iteritems():
        stocks['status_text'] = stocks['status_text'].str.replace(stock_name,' '+sym[1:].lower()+' ')
    stocks['symbol'] = stocks['symbol'].str.lower()
    stocks = stocks[stocks.status_text.apply(remove_encodings)]
    stocks = stocks[stocks.apply(find_symbol,axis=1)]
    if use_negations: stocks['negation_word'] = stocks.status_text.str.contains('negation_word')
    stocks['words'] = stocks['status_text'].str.split()
    return stocks