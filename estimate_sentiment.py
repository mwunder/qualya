
# from sklearn import linear_model, tree, ensemble
# from sklearn.linear_model import * 
# from sklearn.feature_selection import *

import preprocess_statuses
from preprocess_statuses import *

def predict_score(words):
    if not [w for w in words if w in sorted_scores and is_num(w) and reverse_dict[w] not in symbols]:
        return 0.55
    return np.mean([sorted_scores[w] for w in words if w in sorted_scores \
        and is_num(w) and reverse_dict[w] not in symbols])

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

# stocks['clm_predicted'] =  clm.predict(X)
stocks['clm_predicted'] = X.dot(clm[0])+clm[1]
stocks['clm_predicted'] = (stocks['clm_predicted']>=0)*stocks['clm_predicted']
stocks['clm_predicted'] = (stocks['clm_predicted']<=1)*stocks['clm_predicted'] + 1*(stocks['clm_predicted']>1)
# stocks['forest'] = forest.predict(X)
# stocks['lasso'] = lasso.predict(X)
stocks['lasso'] = X.dot(lasso[0])+lasso[1]
stocks['predicted_scores'] = stocks['indexed_words'].apply(predict_score)

stocks['ensemble'] = (stocks['lasso']+stocks['clm_predicted']+stocks['predicted_scores'])/3.0 #stocks['forest']+
stocks['ensemble'] = (stocks['ensemble']>=0)*stocks['ensemble']
stocks['ensemble'] = (stocks['ensemble']<=1)*stocks['ensemble'] + 1*(stocks['ensemble']>1)

bin_edges = np.array([0.0,0.25,0.499,clm[1]+0.01,0.76,1.0])

stocks['bin'] = 0 + -2*(stocks['ensemble']<=bin_edges[1]) - ((stocks['ensemble']>bin_edges[1])&(stocks['ensemble']<=bin_edges[2])) + \
                        ((stocks['ensemble']>=bin_edges[3])&(stocks['ensemble']<bin_edges[4])) + 2*((stocks['ensemble']>=bin_edges[4])&(stocks['ensemble']<bin_edges[5]))

updated_count = 0 
not_updated_count = 0 
updated_ids = []
for i,row in stocks.iterrows():
    stock_status = Stock_status.objects.filter(id=row['id'], status_id=row['status_id'])
    if not stock_status or row['id'] in updated_ids: 
        not_updated_count+=1
        continue
    stock_status = stock_status[0]
    stock_status.status_sentiment = 2*(max(-0.5,min(0.5,row['ensemble']-clm[1])))
    stock_status.sentiment_bin = row['bin']
    stock_status.save()
    updated_count += 1 
    updated_ids.append(row['id'])

print updated_count,not_updated_count
