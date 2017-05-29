# -*- coding: utf-8 -*-
"""
Created on Sun Jul 12 23:00:52 2015

@author: mwunder
"""
from __future__ import print_function
import nltk 
import datetime, re
from datetime import * 

WORLD_WOE_ID = 1
US_WOE_ID = 23424977

woe_ids = {'World':1, 'US':23424977 ,'London':44418,'DC':2514815,'LA':2442047,'NYC':2459115,'SF':2487956}  #'Germany':23424829,
# 'NY':2347591, 'TX':2347602,'FL':2347568, , 'Palo Alto':2467861# 'CA':2347563,'Brooklyn':12589335,'Manhattan': 12589342, 

days = {0:'Mon',1:'Tue',2:'Wed',3:'Thu',4:'Fri',5:'Sat',6:'Sun'}
mons = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}
today = datetime.today()

stopwords = set(nltk.corpus.stopwords.words('english'))
stopwords = stopwords | set(['&amp', 'retweet','rt','ht','http','https','amp','...'])
xxxlist = set(['asian','teen','porn','sex','xxx','fuck','blond','schoolgirl','ink','canadiannanny.ca',
'blonde','tattoo','tattoos','tatted','boyfriend','blowjob','download','job','jobs','creampie','tits','slut','masturbate'])

stop_tags = {'weed','cannabis', 'job','jobs','hiring','tweetmyjobs','etsymntt','etsy','nowplaying','rt','retweet','soundcloud','fav','follow','quote',
             'porn','sex','sexy','porno','nude','nsfw','dicks','cocks','cock','dick','pussy','fuck','xxx','fuckinggirls',
             'cum','pornpussy','fuckvideo','fuckedhard','wetpussy','sextape','sexpussy','titssex','sexcams','tittyfuck',
             'fuckpussy','cumpussy','shavedpussy','pussyeating','pussylicking','pussyfucking','pussyfuck','rubpussy','fuckmypussy',
             'eatingpussy','doggystyle','doggiefuck','doublepenetration','sexmassage','bigdicks','bigcocks','bigtits','hugedick','tinydick',
             'ridingcock','gamecocks','cocksucking','cocksuckers','cocksuck','hardcock','oralcock','bigblackcock','bigcock',
             'bigdick','bigtit','bigpenis','bigboob','hardsex','fucking','smalltits','roughfuck','camshow','camwhore','masturbating',
             'titlicking','titfucking','titfuck','tinytits','titjob','girlfuckedhard','tits','nicetits','hugetits','naturaltits',
             'venusexchange','cougarsex','massagesex','oralsex','groupsex','camsex','sexi','realsex','spysex','oralsexporn',
             'hotsex','analsex','asssex','buttsex','blacksex','sexo','sextoys','asiansex','boobsex','lesbiansex','schoolsex'}

stop_substring = {'pussy','cock','dick','sex','porn','tits'}

stopwords = stopwords | xxxlist | stop_tags | {'mtvhottest'}

greek_hashtags = ['eu', 'greece2015', 'greekcrisis', 'thisisacoup', 'europe', 'eurozone', 'grexit', 'tsipras', 'berlin', 'greece', 'brussels', 'loans', 'crisis', 'spain', 'italy', 'imf',  'athens', 'france', 'eurosummit',  'russia', 'creditors', 'schaeuble',  'euro', 'bailout']

physics_keywords = ['physics','physicist','science','scientist','lab','experiment',
'collider',' ion','collision','astro','cosmo','research','space']

non_physics_keywords = ['UN']

def split_mult(sep):
    return lambda s: re.split(sep,s)

def tolower(x): return x.lower()

def is_num(s):
    try:
        float(s)
        return True
    except:
        return False

def date_str(d):
    return days[d.weekday()]+' '+mons[d.month]+' '+str(d.day)+' '+str(d.hour)+':'+str(d.minute)+':'+str(d.second)+' +0000 '+str(d.year)

def datetime_id(d):
    return 10000000000*d.year +100000000*d.month+ 1000000*d.day+ 10000*d.hour+ 100*d.minute + d.second

def qtr_hr(minute): 
    return 15*(minute/15)

def id_hr(date_id):
    return 10000*(date_id/10000)
    
def id_day(date_id):
    return 100000*(date_id/100000)

def id_hr_var(date_id,window=60):
    if window >= 720: return date_id - date_id%100000000 + 1000000
    return date_id - (date_id%1000000)% (10000*window)

def strptimeformat(f='%m/%d/%y %H:%M'):
    return lambda s : datetime.strptime(s,f)

def datetime_id_qtrhr(d):
    return 10000000000*d.year +100000000*d.month+ 1000000*d.day+ 10000*d.hour+ 100*qtr_hr(d.minute)

def datetime_id_hour(d):
    return 10000000000*d.year +100000000*d.month+ 1000000*d.day+ 10000*d.hour

# def datetime_id_day(d,offset=-240): # Use the date but offset by 4 hours for EDT. 
#     d = d + timedelta(minutes=offset)
#     return 10000000000*d.year +100000000*d.month+ 1000000*d.day

def datetime_id_window(w):
    return lambda d :  ((1000000*d.year +10000*d.month+ 100*d.day+ d.hour)/(w/60)) * (10000* w/60) 

def datetime_id_day(d):
    return 10000000000*d.year +100000000*d.month+ 1000000*d.day

def id_to_datetime(di):
    return datetime.strptime(str(di),'%Y%m%d%H%M%S')

def date_record_to_date(d_string):
    return datetime.strptime(d_string,"%a %b %d %H:%M:%S +0000 %Y")

def date_record_to_hour(d_string):
    try:    return datetime.strptime(re.search('(.*?):',d_string).group(1)+' '+d_string[-4:],"%a %b %d %H %Y") #d_string[:13].replace(':','')
    except: -1
    
def sql_datetime(d):
    return str(d.year)+'-'+str(d.month)+'-'+str(d.day) +' '+str(d.hour)+':'+str(d.minute)+':'+str(d.second)

def add_zeros(s):
    return s if len(s)>1 else '0'+s

def sql_full_datetime(d):
    return str(d.year)+'-'+add_zeros(str(d.month))+'-'+add_zeros(str(d.day)) +' '+add_zeros(str(d.hour))+':'+add_zeros(str(d.minute))+':00'

def sql_full_datetime_from_id(d):
    return str(d/10000000000)+'-'+add_zeros(str(d/100000000 %100))+'-'+add_zeros(str(d/1000000 %100)) + \
    ' '+add_zeros(str(d/10000 %100))+':'+add_zeros(str(d/100 %100))+':00'

def sql_date(d):
    return str(d.year)+'-'+str(d.month)+'-'+str(d.day) 

def minutes_diff(t1,t2):
    td = (t2-t1)
    return td.days*24*60 + td.seconds/60.0

def shift_date(d,offset=-240): # Use the date but offset by 4 hours for EDT. 
    return d + timedelta(minutes=offset)   #sql_full_datetime(datetime.strptime(d,'%m/%d/%y %H:%M:%S') + timedelta(minutes=offset))

def shift_date_id(dateid,offset=-240):
    return datetime_id_hour(id_to_datetime(dateid) + timedelta(minutes=offset))
    # return dateid + offset * 10000

def hours_diff(date1,date2):
    return (date2-date1).days*24 + (date2-date1).seconds/3600 

def get_date_from(request):
    #return datetime.now() 
    if 'date' not in request:
        return  datetime.now()  #id_to_datetime(datetime_id_day(datetime.now())) + timedelta(minutes=0)
    try: 
        if len(request['date'])>4:
            return datetime.strptime(request['date'],'%Y-%m-%d')
        else:
            print (id_to_datetime(str(datetime.now().year)+
                request['date'].replace('/','')+'000000'))
            return id_to_datetime(str(datetime.now().year)+
                request['date'].replace('/','')+'000000')
    except: 
        return datetime.now() 
    return datetime.now() 

# epoch = datetime.datetime.utcfromtimestamp(0)
# def unix_time_millis(dt):
#     return (dt - epoch).total_seconds() * 1000.0