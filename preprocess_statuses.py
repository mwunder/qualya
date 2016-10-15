from sentiment_refs import *
from sentiment.models import *
from collections import Counter, defaultdict
import pickle 

use_negations = 1
vocab_size = 50000

model_object = pickle.load(open('models/models.p'))
dictionary = model_object['dictionary']
word_index = model_object['word_index']
clm = model_object['clm']
lasso = model_object['lasso']
# forest = model_object['forest']
sorted_scores = model_object['sorted_scores']
reverse_dict = model_object['reverse_dict']

def stems(words): 
    return [st.stem(w) for w in words]

def index_words(word): 
    if type(word)==str or type(word)==unicode:
        word = st.stem(word)
        if word in dictionary: 
            return dictionary[word]  
    else:
        return  (dictionary[st.stem(word[0])],dictionary[st.stem(word[1])])

def bigramize(word_indexes,bigram_stop_len = 0 ) : return [(w,x) for w,x in zip(word_indexes[:-1],word_indexes[1:]) \
                              if w>bigram_stop_len and x>bigram_stop_len and reverse_dict[w] not in symbols \
                              and reverse_dict[x] not in symbols and reverse_dict[w].replace('#','')!=reverse_dict[x].replace('#','')]


# stocks = pd.read_csv('stock_scores.csv')
# stocks['trading_day'] = (pd.to_datetime(stocks.ix[:,'created_at'])-timedelta(minutes=930)).apply(datetime.date)
# stock_test = pd.read_csv('sent_test.csv')
# stock_test['trading_day'] = pd.to_datetime(stock_test.ix[:,'created_at']).apply(datetime.date)
# stocks = pd.concat([stocks, stock_test]) 

stocks = pd.DataFrame(columns=['id','status_id','created_at','status_text','status_sentiment','stock_id','symbol'])
statuses = Stock_status.objects.filter(status_sentiment=0, created_at__gte=datetime.date(datetime.now()-timedelta(minutes=10*1440))) 
for status in statuses:
    # if status.status_sentiment != 0: continue
    stocks = stocks.append(pd.DataFrame({ 'id':status.id, 'status_id':status.status_id,
                'created_at': status.created_at,
                'status_text':status.status_text, 'symbol':status.symbol,
                'stock_id':status.stock_id,
                'status_sentiment':0},index=[stocks.shape[0]]))

print stocks.shape 
stocks['status_text'] = stocks['status_text'].str.replace('[A-Z][a-z]{4,12} [lL][lL][cC]\.?',' Institution_name ')
stocks['status_text'] = stocks['status_text'].str.replace('[A-Z][a-z]{4,12} [iI][n][c]\.?',' Institution_name ')
stocks['status_text'] = stocks['status_text'].str.replace('RBC [A-Z][a-z]{4,12}',' Institution_name ')
stocks['status_text'] = stocks['status_text'].str.replace(' [A-Z][a-z]{4,12} {1,2}[A-Z][a-z]{4,12} ',' institution_name ')
stocks['status_text'] = stocks['status_text'].str.lower()
stocks['status_text'] = stocks.apply(replace_status_with_signal,axis=1)
stocks['status_text'] = stocks['status_text'].str.replace('https?://.{4,15} ?','  hyperlink ')
stocks['status_text'] = stocks['status_text'].str.replace('@[a-z_]{3,15} ','  t_handle ')

stocks['status_text'] = stocks['status_text'].str.replace('\$[0-9]{1,3}[^,]',' num_price ') 
stocks['status_text'] = stocks['status_text'].str.replace('\$[0-9,]+',' num_cash ') 
stocks['status_text'] = stocks['status_text'].str.replace('[0-9]+','       num_string ') 

for p,r in replace_pairs.items() + replace_strings.items() : #symbol_index.items()+
    stocks['status_text'] = stocks['status_text'].str.replace(p,r.lower())

for sym in symbols:
    stocks['status_text'] = stocks['status_text'].str.replace(sym,' '+sym+' ')

# stocks['status_text'] = stocks['status_text'].str.replace("'",' ')

for sym,stock_name in symbol_dict.iteritems():
    stocks['status_text'] = stocks['status_text'].str.replace(stock_name,' '+sym[1:].lower()+' ')

stocks['symbol'] = stocks['symbol'].str.lower()

stocks['status_text'] = stocks['status_text'].str.replace('google? ',' goog ')

stocks = stocks[stocks.status_text.apply(remove_encodings)]
stocks = stocks[stocks.apply(find_symbol,axis=1)]
# stocks['created_at'] = stocks.created_at.apply(trunc_str(5))
# stocks = stocks.groupby([ 'symbol', 'status_text', 'created_at', 'trading_day'])['score'].mean().reset_index()

if use_negations: stocks['negation_word'] = stocks.status_text.str.contains('negation_word')

stocks['words'] = stocks['status_text'].str.split()
stocks['indexed_words'] = stocks['words'].apply(stems).apply(kw_index(dictionary))
stocks['bigrams'] = stocks['indexed_words'].apply(bigramize).apply(set)

stocks['bag_of_words']=stocks['indexed_words'].apply(set)
stocks['bag_of_words']= stocks.apply(series_union('bag_of_words','bigrams'),axis=1)
stocks['nonstopwords'] = stocks.indexed_words.apply(unindex(reverse_dict))
stocks.index = np.arange(stocks.shape[0])
stocks = stocks.sort_index()
stocks['bigrams'] = stocks['bigrams'].apply(list)

# dictionary = pickle.load('models/dictionary.p') 
# word_index = pickle.load('models/word_index.p')
# clm = pickle.load('models/clm.p')
# lasso = pickle.load('models/lasso.p')
# forest = pickle.load('models/forest.p')
# sorted_scores = pickle.load('models/sorted_scores.p')




