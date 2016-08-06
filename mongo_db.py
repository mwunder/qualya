# -*- coding: utf-8 -*-
"""
Created on Tue Dec 30 16:01:29 2014

@author: mwunder
"""

import json
import pymongo # pip install pymongo

def save_to_mongo(data, mongo_db, mongo_db_coll, **mongo_conn_kw):
    
    # Connects to the MongoDB server running on 
    # localhost:27017 by default
    
    client = pymongo.MongoClient(**mongo_conn_kw)
    
    # Get a reference to a particular database
    
    db = client[mongo_db]
    
    # Reference a particular collection in the database
    
    coll = db[mongo_db_coll]
    
    # Perform a bulk insert and  return the IDs
    
    return coll.insert(data)

def load_from_mongo(mongo_db, mongo_db_coll, return_cursor=False,
                    criteria=None, projection=None, **mongo_conn_kw):
    
    # Optionally, use criteria and projection to limit the data that is 
    # returned as documented in 
    # http://docs.mongodb.org/manual/reference/method/db.collection.find/
    
    # Consider leveraging MongoDB's aggregations framework for more 
    # sophisticated queries.
    
    client = pymongo.MongoClient(**mongo_conn_kw)
    db = client[mongo_db]
    coll = db[mongo_db_coll]
    
    if criteria is None:
        criteria = {}
    
    if projection is None:
        cursor = coll.find(criteria)
    else:
        cursor = coll.find(criteria, projection)

    # Returning a cursor is recommended for large amounts of data
    
    if return_cursor:
        return cursor
    else:
        return [ item for item in cursor ]

def transfer_collections_to_collection(mongo_db,new_db='higgs_crawl',del_id_chars=11,old_id='friends'):
    client = pymongo.MongoClient()
    db = client[mongo_db]
    newdb = client[new_db]
    new_collection = newdb[old_id]
    i = 0 
    for coll in db.collection_names(include_system_collections=False):
        old_coll = load_from_mongo(mongo_db,coll)
        if old_coll:
            if len(old_coll)>1:
                new_collection.insert({'user_id':coll[:-11],'friends':old_coll[1][old_id]})
            else:
                new_collection.insert({'user_id':coll[:-11],'friends':old_coll[0][old_id]})
            i+=1
    return i
    
def transfer_collections_to_documents(mongo_db,new_db='twitter_users',old_id='user'):
    client = pymongo.MongoClient()
    db = client[mongo_db]
    newdb = client[new_db]
    new_collection = newdb['higgs_users']
    i = 0
    for coll in db.collection_names(include_system_collections=False):
        old_coll = load_from_mongo(mongo_db,coll)
        #print coll 
        if not [d for d in old_coll if 'user' in d.keys() and check_physics(d['user'])]: 
            continue 
        #print [d.keys() for d in old_coll]
        docs = [extract_user_info(doc['user']) if 'user' in doc.keys() else doc for doc in old_coll]
        new_collection.insert([{'user_id':coll[:-11],'user_info':doc} for doc in docs])
        i+=len(old_coll)
    return i
    
def remove_users(mongo_db,coll='higgs_users'):
    client = pymongo.MongoClient()
    db = client[mongo_db]
    users = load_from_mongo(mongo_db,coll)
    remove_ids = set(u['user_id'] for u in users if not check_physics(u['user_info']))
    num_removed = 0
    for i in remove_ids:
        try: num_removed += db[coll].remove({'user_id':i})['n']
        except: print i , num_removed
    return len(remove_ids),num_removed
    
def copy_without_dupes(mongo_db='twitter_users',coll='higgs_users',new_coll='higgs'):
    client = pymongo.MongoClient()
    db = client[mongo_db]
    most_recent_dates = defaultdict(str)
    for u in load_from_mongo(mongo_db,coll):
        if not most_recent_dates[u['user_id']]: 
            most_recent_dates[u['user_id']] = u['user_info']['date_entered']
            db[new_coll].insert(extract_user_info(u['user_info']))
        else: 
            if (datetime.strptime(most_recent_dates[u['user_id']], "%a %b %d %H:%M:%S +0000 %Y")-
                datetime.strptime(u['user_info']['date_entered'], "%a %b %d %H:%M:%S +0000 %Y")).days<=1:
                    continue
            else:
                most_recent_dates[u['user_id']] = \
                date_str(max(datetime.strptime(most_recent_dates[u['user_id']], "%a %b %d %H:%M:%S +0000 %Y"),
                    datetime.strptime(u['user_info']['date_entered'], "%a %b %d %H:%M:%S +0000 %Y")))
                db[new_coll].insert(extract_user_info(u['user_info']))
    

# Sample usage
"""
q = 'CrossFit'

twitter_api = oauth_login()
results = twitter_search(twitter_api, q, max_results=10)

save_to_mongo(results, 'search_results', q)

load_from_mongo('search_results', q)
"""