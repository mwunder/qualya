import django
from django.shortcuts import render
from django.template import Template, Context
from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from sentiment.models import *
import datetime, re
from datetime import * 

class Score:
    def __init__(self,symbol,t,sc=0,f=0,z=0,c=0):
        self.symbol=symbol
        self.created_at = t
        self.scored_at= t 
        self.scores = sc
        self.freq = f
        self.z = z

def set_scores(sentiment,t): 
     return [Score(sym,t,scores) for sym,scores in sentiment.items() ]


def get_date_from(request,default_date=''):
    #return datetime.now() 
    if 'date' not in request:
        return  datetime.now()  if not default_date else default_date #id_to_datetime(datetime_id_day(datetime.now())) + timedelta(minutes=0)
    try: 
        if len(request['date'])>4:
            return datetime.strptime(request['date'],'%Y-%m-%d')
        else:
            print id_to_datetime(str(datetime.now().year)+
                request['date'].replace('/','')+'000000')
            return id_to_datetime(str(datetime.now().year)+
                request['date'].replace('/','')+'000000')
    except: 
        return datetime.now() if not default_date else default_date

    return datetime.now() if not default_date else default_date

def home(request):
    return render(request,'home.html')

def stock_sentiment(request):
    interval = 1440 if 'w' not in request.GET or not is_num(request.GET['w']) else  int(request.GET['w'])
    end_date = get_date_from(request.GET,datetime.strptime('2016-08-08','%Y-%m-%d'))
    statuses = Stock_status.objects.filter(created_at__gte=end_date,\
        created_at__lte=end_date+timedelta(minutes=interval))
    symbol_scores = {}
    for status in statuses: 
        if not status.status_sentiment or status.status_sentiment< -1 or status.status_sentiment>1: continue 
        try:    symbol_scores[status.symbol].append(status.status_sentiment)
        except: symbol_scores[status.symbol] = [status.status_sentiment]
    for stock in symbol_scores.keys():
        symbol_scores[stock] = sorted(symbol_scores[stock])
    # print symbol_scores.keys()
    return render(request,'stock_sentiment.html', 
        {   'symbol_scores':set_scores(symbol_scores,end_date),
            'symbols': map(str,symbol_scores.keys()), 
            'scores': symbol_scores.values()} )
        # {'symbols': symbol_scores.keys(),
        #  'sentiments': symbol_scores.values()})
