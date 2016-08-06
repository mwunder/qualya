import sys, csv, time, datetime,string , itertools
from urllib2 import URLError
from httplib import BadStatusLine
import json,platform
import twitter
from functools import partial
from datetime import *
from sys import maxint
import mongo_db
#import matplotlib.pyplot as plt
from mongo_db import *
from collections import Counter,defaultdict
import twitter_refs
from twitter_refs import *
#if platform.system()=='Linux': 
#from zitegeist.models import *

''' Functions for interacting with the twitter API, to avoid multiple OAuth copies. ''' 

def filter_statuses(result):
    return result['user']['time_zone'] and result['user']['time_zone'].find("US")>=0

def oauth_login():
    # XXX: Go to http://twitter.com/apps/new to create an app and get values
    # for these credentials that you'll need to provide in place of these
    # empty string values that are defined as placeholders.
    # See https://dev.twitter.com/docs/auth/oauth for more information 
    # on Twitter's OAuth implementation.
    
    CONSUMER_KEY = 'uyIag1G4EsYcJWFu17j3gA8xb'
    CONSUMER_SECRET = 'Z5atSK30tuY8SVsyFXJjGYhjnq7WP0ihFaP3u147SLzRIFKrs1'
    OAUTH_TOKEN = '19629739-pW9thT8cMTCVGU6Ekcr9IB9yPLrMrzLcozt5x8kRv'
    OAUTH_TOKEN_SECRET = 'he2S1uoE9vSwamm3QXkbCqM4vVRKgBDyQvbRYCbPxXhZ7'
    
    auth = twitter.oauth.OAuth(OAUTH_TOKEN, OAUTH_TOKEN_SECRET,
                               CONSUMER_KEY, CONSUMER_SECRET)
    
    twitter_api = twitter.Twitter(auth=auth)
    return twitter_api

def make_twitter_request(twitter_api_func, max_errors=10, *args, **kw):     
    # A nested helper function that handles common HTTPErrors. Return an updated
    # value for wait_period if the problem is a 500 level error. Block until the
    # rate limit is reset if it's a rate limiting issue (429 error). Returns None
    # for 401 and 404 errors, which requires special handling by the caller.
    def handle_twitter_http_error(e, wait_period=2, sleep_when_rate_limited=True):
        if wait_period > 3600: # Seconds
            print >> sys.stderr, 'Too many retries. Quitting.'
            raise e
    
        # See https://dev.twitter.com/docs/error-codes-responses for common codes
    
        if e.e.code == 401:
            print >> sys.stderr, 'Encountered 401 Error (Not Authorized)'
            return None
        elif e.e.code == 404:
            print >> sys.stderr, 'Encountered 404 Error (Not Found)'
            return None
        elif e.e.code == 429: 
            print >> sys.stderr, 'Encountered 429 Error (Rate Limit Exceeded)'
            if sleep_when_rate_limited:
                print >> sys.stderr, "Retrying in 15 minutes...ZzZ..."
                sys.stderr.flush()
                time.sleep(60*15 + 5)
                print >> sys.stderr, '...ZzZ...Awake now and trying again.'
                return 2
            else:
                raise e # Caller must handle the rate limiting issue
        elif e.e.code in (500, 502, 503, 504):
            print >> sys.stderr, 'Encountered %i Error. Retrying in %i seconds' % \
                (e.e.code, wait_period)
            time.sleep(wait_period)
            wait_period *= 1.5
            return wait_period
        else:
            raise e

    # End of nested helper function
    
    wait_period = 2 
    error_count = 0 

    while True:
        try:
            return twitter_api_func(*args, **kw)
        except twitter.api.TwitterHTTPError, e:
            error_count = 0 
            wait_period = handle_twitter_http_error(e, wait_period)
            if wait_period is None:
                return
        except URLError, e:
            error_count += 1
            print >> sys.stderr, "URLError encountered. Continuing."
            if error_count > max_errors:
                print >> sys.stderr, "Too many consecutive errors...bailing out."
                raise
        except BadStatusLine, e:
            error_count += 1
            print >> sys.stderr, "BadStatusLine encountered. Continuing."
            if error_count > max_errors:
                print >> sys.stderr, "Too many consecutive errors...bailing out."
                raise

# Sample usage

#twitter_api = oauth_login()

# See https://dev.twitter.com/docs/api/1.1/get/users/lookup for 
# twitter_api.users.lookup

#response = make_twitter_request(twitter_api.users.lookup, screen_name="SocialWebMining")

#print json.dumps(response, indent=1)

def twitter_trends(twitter_api, woe_id):
    # Prefix ID with the underscore for query string parameterization.
    # Without the underscore, the twitter package appends the ID value
    # to the URL itself as a special-case keyword argument.
    return twitter_api.trends.place(_id=woe_id)

# Sample usage

# See https://dev.twitter.com/docs/api/1.1/get/trends/place and
# http://developer.yahoo.com/geo/geoplanet/ for details on
# Yahoo! Where On Earth ID

def date_str(d):
   return days[d.weekday()]+' '+mons[d.month]+' '+str(d.day)+' '+str(d.hour)+':'+str(d.minute)+':'+str(d.second)+' +0000 '+str(d.year)

todays_date_string =  date_str(today)

def track_trends (twitter_api,update_mongo=0):
    all_trends = []
    today_string = date_str(datetime.now()) 
    for woe,woe_id in woe_ids.items():
      try:
        #print woe
        if not check_rate_status(twitter_api,'trends','/trends/place'):
            print 'rate limit exceeded'
            sys.stderr.flush()
            time.sleep(15*60+5)
            if not check_rate_status(twitter_api,'trends','/trends/place'):  break
        trends = twitter_trends(twitter_api, woe_id)[0]['trends']
        all_trends += [{'woe':woe,'time':today_string,'trend':trend['name'],'rank':i+1}
            for i,trend in enumerate(trends)]
      except: 
          print woe, len(all_trends)
          break
    if all_trends and update_mongo:
        save_to_mongo(all_trends,'trends','top_trends')
    return all_trends



#world_trends = twitter_trends(twitter_api, WORLD_WOE_ID)
#print json.dumps(world_trends, indent=1)

#us_trends = twitter_trends(twitter_api, US_WOE_ID)
#print json.dumps(us_trends, indent=1)

def check_rate_status(twitter_api,label,prop):
    rate_status = twitter_api.application.rate_limit_status()
    return rate_status['resources'][label][prop]['remaining']

def get_friends_followers_ids(twitter_api, screen_name=None, user_id=None,
                              friends_limit=maxint, followers_limit=maxint):
    
    # Must have either screen_name or user_id (logical xor)
    assert (screen_name != None) != (user_id != None), \
    "Must have screen_name or user_id, but not both"
    
    # See https://dev.twitter.com/docs/api/1.1/get/friends/ids and
    # https://dev.twitter.com/docs/api/1.1/get/followers/ids for details
    # on API parameters
    
    get_friends_ids = partial(make_twitter_request, twitter_api.friends.ids, 
                              count=5000)
    get_followers_ids = partial(make_twitter_request, twitter_api.followers.ids, 
                                count=5000)

    friends_ids, followers_ids = [], []
    
    for twitter_api_func, limit, ids, label in [
                    [get_friends_ids, friends_limit, friends_ids, "friends"], 
                    [get_followers_ids, followers_limit, followers_ids, "followers"]
                ]:
        
        if limit == 0: continue
        
        cursor = -1
        while cursor != 0:
            if not check_rate_status(twitter_api,label,'/'+label+'/ids'):
                print >> sys.stderr, 'Reached rate limit. Total ids: {0}'.format(len(ids))
                sys.stderr.flush()
                time.sleep(15*60+5)
            # Use make_twitter_request via the partially bound callable...
            if screen_name: 
                response = twitter_api_func(screen_name=screen_name, cursor=cursor)
            else: # user_id
                response = twitter_api_func(user_id=user_id, cursor=cursor)

            if response is not None:
                ids += response['ids']
                cursor = response['next_cursor']
        
            #print >> sys.stderr, 'Fetched {0} total {1} ids for {2}'.format(len(ids), 
            #                                        label, (user_id or screen_name))
        
            # XXX: You may want to store data during each iteration to provide an 
            # an additional layer of protection from exceptional circumstances
            if len(ids) >= limit or response is None:
                break

    # Do something useful with the IDs, like store them to disk...
    return friends_ids[:friends_limit], followers_ids[:followers_limit]

def twitter_search(twitter_api, q, max_results=200, **kw):
    # See https://dev.twitter.com/docs/api/1.1/get/search/tweets and 
    # https://dev.twitter.com/docs/using-search for details on advanced 
    # search criteria that may be useful for keyword arguments
    
    # See https://dev.twitter.com/docs/api/1.1/get/search/tweets    
    search_results = twitter_api.search.tweets(q=q, count=100, **kw)
    
    statuses = search_results['statuses']
    
    # Iterate through batches of results by following the cursor until we
    # reach the desired number of results, keeping in mind that OAuth users
    # can "only" make 180 search queries per 15-minute interval. See
    # https://dev.twitter.com/docs/rate-limiting/1.1/limits
    # for details. A reasonable number of results is ~1000, although
    # that number of results may not exist for all queries.
    
    # Enforce a reasonable limit
    max_results = min(1000, max_results)
    
    for _ in range(10): # 10*100 = 1000
        try:
            next_results = search_results['search_metadata']['next_results']
        except KeyError, e: # No more results when next_results doesn't exist
            break
            
        # Create a dictionary from next_results, which has the following form:
        # ?max_id=313519052523986943&q=NCAA&include_entities=1
        kwargs = dict([ kv.split('=') 
                        for kv in next_results[1:].split("&") ])
        #print kwargs
        search_results = twitter_api.search.tweets(**kwargs)
        statuses += search_results['statuses']
        
        if len(statuses) > max_results: 
            break
    return [status for status in statuses if filter_statuses(status)]
    
#results = twitter_search(twitter_api, q, max_results=1000)

def check_physics(user):
    return any((w in user['description'].lower()+user['screen_name'].lower()) for w in physics_keywords) and \
    int(user['created_at'][-2:])<=12

def crawl_friends(twitter_api, screen_name, limit=100000, depth=2):
    get_users_show = partial(make_twitter_request, twitter_api.users.lookup)

    # Resolve the ID for screen_name and start working with IDs for consistency 
    # in storage

    seed_id = str(twitter_api.users.show(screen_name=screen_name)['id'])
    
    friend_queue, next_queue = get_friends_followers_ids(twitter_api, user_id=seed_id, 
                                              friends_limit=limit, followers_limit=0)

    # Store a seed_id => _follower_ids mapping in MongoDB
    user_info = get_users_show(user_id=seed_id)[0]
    save_to_mongo({'user' : user_info}, 
                          'user_info', '{0}-user_id'.format(seed_id))
    if next_queue:
        save_to_mongo({'followers' : [ _id for _id in next_queue ]}, 'followers_crawl', 
                      '{0}-follower_ids'.format(seed_id))
    save_to_mongo({'friends' : [ _id for _id in friend_queue ]}, 'friends_crawl', 
                  '{0}-friend_ids'.format(seed_id))
    d = 1
    fids = ['{0}-follower_ids'.format(seed_id)]
    fr_ids = ['{0}-friend_ids'.format(seed_id)]
    #print friend_queue[:limit]
    while d < depth:
        d += 1
        (queue, friend_queue) = (friend_queue, [])
        'crawling {0} ids.'.format(len(queue))
        for fid in queue:
            if load_from_mongo('user_info','{0}-user_id'.format(fid)): 
                continue
            if not check_rate_status(twitter_api,'users','/users/lookup'):
                print >> sys.stderr, 'Reached rate limit. Total ids left: {0}'.format(len(queue)-queue.index(fid))
                sys.stderr.flush()
                time.sleep(15*60+5)
            user_info = get_users_show(user_id=fid)[0]
            if not check_physics(user_info): continue
            print 'crawling {0}'.format(user_info['screen_name'])
            save_to_mongo({'user' : user_info}, 
                          'user_info', '{0}-user_id'.format(fid))
            time.sleep(0.2)
            if load_from_mongo('friends_crawl','{0}-friend_ids'.format(fid)): 
                continue
            
            friend_ids, follower_ids = get_friends_followers_ids(twitter_api, 
                                            user_id=fid, 
                                            friends_limit=limit, 
                                            followers_limit=0)
            
            # Store a fid => follower_ids mapping in MongoDB
            if follower_ids:
                save_to_mongo({'followers' : [ _id for _id in follower_ids ]}, 
                              'followers_crawl', '{0}-follower_ids'.format(fid))
            save_to_mongo({'friends' : [ _id for _id in friend_ids ]}, 'friends_crawl', 
                  '{0}-friend_ids'.format(fid))
            fids.append('{0}-follower_ids'.format(fid))
            fr_ids.append('{0}-friend_ids'.format(fid))
            #next_queue += follower_ids
            friend_queue += friend_ids
    return fids,fr_ids

def crawl_user_status(twitter_api, screen_name=None, user_id= None, status_limit=100):

    # Must have either screen_name or user_id (logical xor)
    assert (screen_name != None) != (user_id != None), \
    "Must have screen_name or user_id, but not both"

    get_user_statuses = partial(make_twitter_request, twitter_api.statuses.user_timeline, 
                              count=100)

    statuses = []
    
    for twitter_api_func, limit, label in [
                    [get_user_statuses, status_limit, "statuses"]]:
        if limit == 0: continue

        cursor = -1
        while cursor != 0:
            if not check_rate_status(twitter_api,label,'/'+label+'/user_timeline'):
                print >> sys.stderr, 'Reached rate limit. Total statuses: {0}'.format(len(statuses))
                sys.stderr.flush()
                time.sleep(15*60+5)
            # Use make_twitter_request via the partially bound callable...
            if screen_name: 
                response = twitter_api_func(screen_name=screen_name, cursor=cursor)
            else: # user_id
                response = twitter_api_func(user_id=user_id, cursor=cursor)

            if response is not None:
                statuses += response
                
            if len(statuses) >= limit or response is None:
                break
    return statuses



