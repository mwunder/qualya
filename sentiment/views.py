import django
from django.shortcuts import render
from django.template import Template, Context
from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from sentiment.models import *
from twitter_refs import *
import datetime, re
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
    symbols = [s.symbol for s in Stock.objects.all()]

    # Pass the symbols to page for use in the dropdown menu
    return render(request,'home.html', { 'symbols': map(str, symbols) })

def stock_sentiment(request):
    ''' The main function for displaying the sentiment scores for one or more stocks in the DB
    '''

    # Fetch the statuses from stock_status given the date constraints
    interval     = 1440 if 'w' not in request.GET or not is_num(request.GET['w']) else int(request.GET['w'])
    current_date = datetime.strptime('2016-08-08','%Y-%m-%d') # Placeholder date, to be replaced or removed
    end_date     = get_date_from(request.GET,current_date) 
    statuses     = Stock_status.objects.filter(created_at__gte=end_date, created_at__lte=end_date+timedelta(minutes=interval))
    
    # Tally up all the sentiment scores from stock_status within valid range, organized by stock symbol
    symbol_scores = {}
    for status in statuses: 
        if not  status.status_sentiment or status.status_sentiment < -1 or status.status_sentiment > 1: continue 
        try:    symbol_scores[status.symbol].append(status.status_sentiment)
        except: symbol_scores[status.symbol] = [status.status_sentiment]

    for stock in symbol_scores.keys():
        symbol_scores[stock] = sorted(symbol_scores[stock])

    # Pass the raw sentiment scores to the page for presenting in visual form 
    return render(request,'stock_sentiment.html', {
              'current_date':  current_date,
              'symbol_scores': set_scores(symbol_scores,end_date),
              'symbols':       map(str,symbol_scores.keys()), 
              'scores':        symbol_scores.values()
           })


#HELPERS
def set_scores(sentiment,t):
    return [Score(sym,t,scores) for sym,scores in sentiment.items() ]

def get_date_from(request,default_date=''):
    ''' Given a request for some date, parse it and return a valid date object.
        Valid forms, for August 9, 2016:
        "2016-08-09"
        "0809" (if called in 2016 only, otherwise will be August 9, XXXX where XXXX is current year)
    '''
    if 'date' not in request:
        return datetime.now() if not default_date else default_date

    try: 
        if len(request['date'])>4:
            return datetime.strptime(request['date'],'%Y-%m-%d')
        else:
            return id_to_datetime(str(datetime.now().year)+
                request['date'].replace('/','')+'000000')
    except: 
        return datetime.now() if not default_date else default_date

    return datetime.now() if not default_date else default_date
