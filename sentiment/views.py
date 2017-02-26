import django
from django.shortcuts import render
from django.template import Template, Context
from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from sentiment.models import *
from twitter_refs import *
from collections import defaultdict, Counter
import datetime, re, math
from datetime import *


class Score:
    ''' An object to represent all the scores of a stock on a specific day or interval
    '''

    def __init__(self,symbol,t,sc=0,f=0,z=0,c=0):
        self.symbol = symbol
        self.created_at = t
        self.scored_at = t
        self.scores = sc
        self.freq = f
        self.z = z


#VIEW FUNCTIONS
def home(request):
    ''' The Home page
    '''

    end_date = datetime.now()
    end_date = datetime(end_date.year,end_date.month,end_date.day)
    statuses = Stock_status.objects.filter(created_at__gte=end_date,sentiment_bin=0, created_at__lte=end_date+timedelta(minutes=1440))

    if not statuses:
        statuses  = Stock_status.objects.filter(sentiment_bin=1)
        last_date = statuses[len(statuses)-1].created_at
        end_date  = get_date_from(request.GET,last_date-timedelta(minutes=1400))
        end_date  = datetime(end_date.year,end_date.month,end_date.day)
        statuses  = Stock_status.objects.filter(created_at__gte=end_date, created_at__lt=end_date+timedelta(minutes=1400))

    symbols = list(set([s.symbol for s in statuses]))

    print len(statuses), symbols
    
    # Pass the date and symbols to the home page
    return render(request,'home.html', {
               'date':    sql_full_datetime(end_date),
               'symbols': sorted(map(str, symbols))
           })

def stock_sentiment_universe(request):
    ''' The main function for displaying the sentiment scores for the universe of stocks in the DB
    '''

    # Fetch the statuses from stock_status given the date constraints
    interval     = 1440 if 'w' not in request.GET or not is_num(request.GET['w']) else 1440*int(request.GET['w'])
    increment    = 0 if 'inc' not in request.GET else int(request.GET['inc'])
    current_date = datetime.now()-timedelta(minutes=interval) # datetime.strptime('2016-08-08','%Y-%m-%d') <-- placeholder date
    end_date     = get_date_from(request.GET,current_date)+timedelta(minutes=1440*increment)
    statuses     = Stock_status.objects.filter(created_at__gte=end_date, created_at__lte=end_date+timedelta(minutes=interval))
    prices       = Stock_price.objects.filter(trading_day__gt=end_date-timedelta(minutes=interval+1400), trading_day__lte=end_date)
    stocks       = Stock.objects.all()

    if not statuses:
        statuses  = Stock_status.objects.filter(sentiment_bin=1)
        last_date = statuses[len(statuses)-1].created_at
        end_date  = get_date_from(request.GET,last_date-timedelta(minutes=1400))
        end_date  = datetime(end_date.year,end_date.month,end_date.day)
        statuses  = Stock_status.objects.filter(created_at__gte=end_date, created_at__lt=end_date+timedelta(minutes=interval))

    # Tally up all the sentiment scores from stock_status within valid range, organized by stock symbol
    stocks        = dict((s.symbol,s.id) for s in stocks)
    symbol_scores = {}
    bins          = defaultdict(list)
    closes        = defaultdict(list)
    volumes       = defaultdict(list)
    
    for status in statuses: 
        if not status.status_sentiment or status.status_sentiment < -1 or status.status_sentiment > 1: continue 
        sym = status.symbol if status.symbol.lower()!='goog' else 'GOOGL'
        try: symbol_scores[sym].append(status.status_sentiment)
        except: symbol_scores[sym] = [status.status_sentiment]
        bins[sym].append(status.sentiment_bin)

    for stock in symbol_scores.keys():
        volumes[stock]       = [int(p.volume) for p in prices if p.stock_id==stocks[stock] ]
        volumes[stock]       = volumes[stock][0]   if volumes[stock] else 0
        closes[stock]        = [p.close_price for p in prices if p.stock_id==stocks[stock] ]
        closes[stock]        = closes[stock][0]    if closes[stock] else 0
        symbol_scores[stock] = sorted(symbol_scores[stock])
        bins[stock]          = map(lambda x:x-1,zip(* sorted(Counter(bins[stock]+[-2,-1,0,1,2]).most_common(5)))[1])
    
    normalized_bins = dict((sym,[b*1./sum(bin_counts) for b in bin_counts]) for sym,bin_counts in bins.items())  

    # Pass the raw sentiment scores to the page for presenting in visual form 
    return render(request,'stock_sentiment_universe.html', {
               'date':          sql_full_datetime(end_date),
               'symbols':       map(str, symbol_scores.keys()),
               'scores':        symbol_scores.values(),
               'closes':        [closes[s] for s in symbol_scores.keys()],
               'volumes':       [volumes[s] for s in symbol_scores.keys()],
               'bins':          [normalized_bins[s] for s in symbol_scores.keys()],
               'symbol_scores': set_scores(symbol_scores, end_date)
           })


def stock_sentiment_historical(request):
    ''' The main function for displaying the sentiment scores for a single stock over time in the DB
    '''

    symbol = request.GET['symbol']

    if 'symbol' not in request.GET:
        return HttpResponse("<html><body>'No stock symbol found'</body></html>")

    # Fetch the statuses from stock_status given the date constraints
    multiplier     = 1 if 'mult' not in request.GET or not is_num(request.GET['mult']) else float(request.GET['mult'])
    w              = max(2,min(120,int(multiplier*(45 if 'w' not in request.GET or not is_num(request.GET['w']) else int(request.GET['w'])))))
    rolling_window = int(math.ceil(w**0.5))
    interval       = 1440*w
    current_date   = datetime.now() # datetime.strptime('2016-08-08','%Y-%m-%d') <-- placeholder date
    end_date       = get_date_from(request.GET,current_date)
    end_date       = datetime(end_date.year,end_date.month,end_date.day)
    empty_d        = { 'current_stock':        symbol,
                       'symbols':              [],
                       'dates':                [],
                       'end_date':             sql_full_datetime(end_date),
                       'closes':               [],
                       'moving_avg_price':     [],
                       'scores_by_date':       [],
                       'avg_sentiment':        [],
                       'moving_avg_sentiment': [],
                       'bins':                 [] }

    stock = Stock.objects.filter(symbol=symbol.lower())
    
    if not stock  :
        return render(request,'stock_sentiment_historical.html', empty_d )
    
    statuses = Stock_status.objects.filter(stock=stock,created_at__gte=end_date-timedelta(minutes=rolling_window*1440+interval-1440), 
                                             created_at__lt=end_date+timedelta(minutes=1140))
    if not statuses:
        statuses  = Stock_status.objects.filter(stock=stock,sentiment_bin=0)
        last_date = statuses[len(statuses)-1].created_at
        end_date  = get_date_from(request.GET,last_date)
        end_date  = datetime(end_date.year,end_date.month,end_date.day)
        statuses  = Stock_status.objects.filter(stock=stock,created_at__gte=end_date-timedelta(minutes=rolling_window*1440+interval-1440), 
                                                  created_at__lt=end_date+timedelta(minutes=1140))

    all_statuses = Stock_status.objects.filter(created_at__gte=end_date,sentiment_bin=0, created_at__lte=end_date+timedelta(minutes=1440))

    symbols = list(set([s.symbol for s in all_statuses]))

    # Fetch prices
    prices = Stock_price.objects.filter(stock=stock,trading_day__gte=end_date-timedelta(minutes=rolling_window+interval+1440*3), trading_day__lte=end_date)

    # Tally up all the sentiment scores from stock_status within valid range, organized by stock symbol
    stock_sentiment_history = defaultdict(list)
    bins                    = defaultdict(list)
    closes                  = dict([(datetime.date(p.trading_day),p.close_price) for p in prices])
    offset                  = timedelta(minutes=0)

    for status in statuses:
        if not status.status_sentiment or status.status_sentiment < -1 or status.status_sentiment > 1: continue
        stock_sentiment_history[datetime.date(status.created_at-offset)].append(status.status_sentiment)
        bins[datetime.date(status.created_at-offset)].append(status.sentiment_bin)

    print [len(v) for v in stock_sentiment_history.values()]

    for day,history in stock_sentiment_history.items():
        stock_sentiment_history[day] = sorted(history)
        bins[day] = map(lambda x:x-1,zip(* sorted(Counter(bins[day]+[-2,-1,0,1,2]).most_common(5)))[1])
        if not closes: continue
        if day not in closes: 
            for d,close in sorted(closes.items()):
                if d<day: closes[day] = close
        if day not in closes: closes[day] = sum(closes.values())/len(closes)

    for day in closes.keys():
        if day not in stock_sentiment_history: del closes[day]

    if not stock_sentiment_history: 
        return render(request,'stock_sentiment_historical.html', empty_d )

    dates, scores_by_date = zip(* sorted(stock_sentiment_history.items()))
    dates, bins           = zip(* sorted(bins.items()))

    if closes: _, closes = zip(* sorted(closes.items()))
    else:         closes = [0]*len(dates)

    closes = list(closes)

    dates           = map(sql_date,dates)
    scores_by_date  = list(scores_by_date)
    bins            = list(bins)
    normalized_bins = list([b*1./sum(bin_counts) for b in bin_counts] for bin_counts in bins)
    avg_sentiment   = [sum(f*b for b,f in zip([-1,-0.5,0,0.5,1],bin) if b)*1.0/(sum(bin[:2]+bin[3:])+1*(sum(bin)==bin[2])) for bin in normalized_bins]
    moving_avg_sentiment, moving_avg_price = zip(*[(sum(avg_sentiment[i-rolling_window:i])/(rolling_window*1.0), sum(closes[i-rolling_window:i])/(rolling_window*1.0)) for i in xrange(rolling_window,len(avg_sentiment))])

    print moving_avg_price, moving_avg_sentiment

    # Pass the raw sentiment scores to the page for presenting in visual form 
    return render(request,'stock_sentiment_historical.html', {
               'current_stock':        symbol,
               'symbols':              sorted(map(str, symbols)),
               'dates':                dates[-w:],
               'end_date':             sql_full_datetime(end_date),
               'closes':               closes[-w:],
               'moving_avg_price':     list(moving_avg_price[-w:]),
               'scores_by_date':       scores_by_date[-w:],
               'avg_sentiment':        avg_sentiment[-w:],
               'moving_avg_sentiment': list(moving_avg_sentiment[-w:]),
               'bins':                 normalized_bins[-w:]
           })

#HELPERS
def get_date_from(request,default_date=''):
    ''' Given a request for some date, parse it and return a valid date object. As an example, valid forms for August 9th, 2016 are:
            (1) "2016-08-09"
            (2) "0809" (if called in 2016 only, otherwise will be August 9th, XXXX where XXXX is current year)
    '''

    if 'date' not in request:
        return datetime.now() if not default_date else default_date
    try: 
        if len(request['date'])>4:
            return datetime.strptime(request['date'],'%Y-%m-%d')
        else:
            return id_to_datetime(str(datetime.now().year)+request['date'].replace('/','')+'000000')
    except:
        return datetime.now() if not default_date else default_date

    return datetime.now() if not default_date else default_date

def set_scores(sentiment,t):
    return [Score(sym,t,scores) for sym,scores in sentiment.items() ]

def add_zeros(s):
    return s if len(s)>1 else '0'+s

def sql_full_datetime(d):
    return str(d.year)+'-'+add_zeros(str(d.month))+'-'+add_zeros(str(d.day)) 
