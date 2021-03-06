
# from sklearn import linear_model, tree, ensemble
# from sklearn.linear_model import * 
# from sklearn.feature_selection import *


try: 
    import sklearn
    from sklearn import linear_model
    from sklearn import tree
    from sklearn.neighbors import *
    import xgboost as xgb
    from xgboost import XGBClassifier,XGBRegressor
except: 
    print 'sklearn not found'

import preprocess_statuses
from preprocess_statuses import *

def predict_score(words):
    if not [w for w in words if w in sorted_scores and is_num(w) and reverse_dict[w] not in symbols]:
        return 0.55
    return np.mean([sorted_scores[w] for w in words if w in sorted_scores \
        and is_num(w) and reverse_dict[w] not in symbols])

maxCol = lambda x: max(x.min(),x.max(),key=abs)

# stocks['score'] = stocks['score']/200.0+ 0.5

# kw_counter = Counter(w for status in stocks['words'] for w in map(st.stem,status) if w not in stopwords and len(w)>=3)
# dictionary = defaultdict(int,
#     zip([w for w,c in kw_counter.most_common(vocab_size)],
#         range(1,vocab_size)))

# reverse_dict = defaultdict(str,[(v,k) for k,v in dictionary.items()])

bigram_stop_len = 0 

X = np.zeros((stocks.shape[0],1+max(word_index.values())))
#Y = np.array(stocks['score']*1)

print stocks.shape
print stocks.columns
print stocks.symbol.dtype

for i,row in stocks.iterrows():
    pos = row['indexed_words'].index(dictionary[row['symbol']])
    for j,w in enumerate(row['indexed_words']):
        if w not in word_index or j==pos or w == dictionary[row['symbol']] or X[i,word_index[w]]: 
            continue 
        X[i,word_index[w]] = 1.0/(1+len(stocks.ix[i,'nonstopwords']+stocks.ix[i,'bigrams'])) #np.exp(decay*(-abs(pos-j)+1))
    for w,x in row['bigrams']:
        if  (w,x) not in word_index or  w not in word_index or w==dictionary[row['symbol']] or x not in word_index or x==dictionary[row['symbol']]: continue
        X[i,word_index[(w,x)]] = 1.0 /(1+len(stocks.ix[i,'nonstopwords']+stocks.ix[i,'bigrams'])) # min(X[i,word_index[w ]],X[i,word_index[x]])
        X[i,word_index[w]] =X[i,word_index[w]]/2.0
        X[i,word_index[x]] =X[i,word_index[x]]/2.0

try: 
    stocks['clm_predicted'] = clm.predict(X)
    stocks['lasso'] = lasso.predict(X)
    stocks['clog_predicted'] =  clog.predict_proba(X)[:,1]
    stocks['rnn_predicted'] = rnn.predict(X)
    stocks['forest_predicted'] = forest.predict(X) 
    stocks['xtree'] = xtree.predict(X)
    score_baseline = 0.53 
except e : 
    print e 
    # stocks['clm_predicted'] =  clm.predict(X)
    stocks['clm_predicted'] = X.dot(clm[0])+clm[1]
    score_baseline = clm[1]
    stocks['clm_predicted'] = (stocks['clm_predicted']>=0)*stocks['clm_predicted']
    stocks['clm_predicted'] = (stocks['clm_predicted']<=1)*stocks['clm_predicted'] + 1*(stocks['clm_predicted']>1)
    # stocks['forest'] = forest.predict(X)
    # stocks['lasso'] = lasso.predict(X)
    stocks['lasso'] = X.dot(lasso[0])+lasso[1]
stocks['predicted_scores'] = stocks['indexed_words'].apply(predict_score)
stocks['sym_lm_predicted'] = stocks['clm_predicted']

try: 
    if forest: 
        stocks['forest_predicted'] = forest.predict(X)
    # for s in stocks.symbol.unique():
    #     if s not in lm_models: 
    #         continue 
    #     stocks.loc[stocks.symbol==s,'sym_lm_predicted'] =  lm_models[s].predict(X[np.array((stocks.symbol==s)),:])
except:
    stocks['forest_predicted'] = stocks['clm_predicted']


stocks['sym_lm_predicted'] = stocks['sym_lm_predicted'].fillna(0)
stocks['sym_lm_predicted'] = (stocks['sym_lm_predicted']<=1)*stocks['sym_lm_predicted'] + 1*(stocks['sym_lm_predicted']>1)
if forest :
    stocks['ensemble'] = (stocks['lasso']+stocks['clm_predicted']+stocks['clog_predicted']+stocks['predicted_scores']+stocks['forest_predicted']+stocks['rnn_predicted']+stocks['xtree'] )/7.0 #
    stocks['max_dev'] = (stocks[['clog_predicted','lasso','clm_predicted','predicted_scores','forest_predicted','rnn_predicted','xtree']] -score_baseline).apply(maxCol,axis=1)+score_baseline
else: 
    stocks['ensemble'] = (stocks['lasso']+stocks['clm_predicted']+stocks['predicted_scores'])/3.0 
    stocks['max_dev'] = (stocks[['lasso','clm_predicted','predicted_scores']] -score_baseline).apply(maxCol,axis=1)+score_baseline

stocks['ensemble'] = (stocks['ensemble']>=0)*stocks['ensemble']
stocks['ensemble'] = (stocks['ensemble']<=1)*stocks['ensemble'] + 1*(stocks['ensemble']>1)

bin_edges = np.array([0.0,0.3,0.49,score_baseline+0.02,0.7,1.0])

stocks['max_dev'] = (stocks['max_dev']<1.0)*stocks['max_dev'] + 1.0*(stocks['max_dev']>=1.0)
stocks['max_dev'] = (stocks['max_dev']>=0.0)*stocks['max_dev'] + 0.0

stocks['bin'] = 0 + -2*(stocks['ensemble']<=bin_edges[1]) - ((stocks['ensemble']>bin_edges[1])&(stocks['ensemble']<=bin_edges[2])) + \
                        ((stocks['ensemble']>=bin_edges[3])&(stocks['ensemble']<bin_edges[4])) + 2*((stocks['ensemble']>=bin_edges[4])&(stocks['ensemble']<=bin_edges[5]))
stocks['bin'] = 0 + -2*(stocks['max_dev']<=bin_edges[1]) - ((stocks['max_dev']>bin_edges[1])&(stocks['max_dev']<=bin_edges[2])) + \
                        ((stocks['max_dev']>=bin_edges[3])&(stocks['max_dev']<bin_edges[4])) + 2*((stocks['max_dev']>=bin_edges[4])&(stocks['max_dev']<=bin_edges[5]))

stocks['bin'] = stocks['bin']*(X.sum(axis=1)!=0)

updated_count = 0 
not_updated_count = 0 
updated_ids = []
for i,row in stocks.iterrows():
    if not updated_count%500: print updated_count
    stock_status = Stock_status.objects.filter(id=row['id'], status_id__gte=row['status_id']-100, status_id__lte=row['status_id']+100)
    if not stock_status or row['id'] in updated_ids: 
        not_updated_count+=1
        continue

    stock_status = stock_status[0]
    # if int(stock_status.status_id)!=int(row['status_id']):
    #     print stock_status.status_id,row['status_id'], row['status_text'],stock_status.status_text 
    stock_status.status_sentiment = 2*(max(-0.5,min(0.5,row['max_dev']-score_baseline)))
    stock_status.sentiment_bin = row['bin']
    stock_status.save()
    updated_count += 1 
    updated_ids.append(row['id'])

print updated_count,not_updated_count
