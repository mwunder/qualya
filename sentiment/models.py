from django.db import models
from django.contrib import auth
from django.contrib.auth.models import User

# Create your models here.

class Stock(models.Model):
    symbol = models.CharField(max_length=10)
    stock_name = models.CharField(max_length=100)
    latest_price = models.FloatField(default=1)
    avg_volume = models.FloatField(default=1)
    outstanding_shares = models.IntegerField(default=1)
    approxmiate_mkt_cap = models.FloatField(default=1)
    class Meta:
        db_table = 'stock'

class Stock_price(models.Model):
    stock = models.ForeignKey(Stock)
    trading_day = models.DateTimeField()
    high_price = models.FloatField(default=1)
    low_price = models.FloatField(default=1)
    open_price = models.FloatField(default=1)
    close_price = models.FloatField(default=1)
    volume = models.IntegerField(default=1)
    class Meta:
        db_table = 'stock_price'

class Stock_status(models.Model):
    stock = models.ForeignKey(Stock)
    symbol = models.CharField(max_length=10)
    status_id = models.BigIntegerField(db_index=True)
    analyst_id = models.BigIntegerField(db_index=True)
    created_at = models.DateTimeField()
    tracked_at = models.DateTimeField()
    status_text = models.CharField(max_length=200)
    status_sentiment = models.FloatField(default=0)
    sentiment_bin = models.IntegerField(default=0)
    retweet_count = models.IntegerField(default=60) 
    favorite_count = models.IntegerField(default=60) 
    class Meta:
        db_table = 'stock_status'

class Stock_sentiment(models.Model):
    stock = models.ForeignKey(Stock)
    symbol = models.CharField(max_length=10)
    created_at = models.DateTimeField()
    window = models.IntegerField(default=60)    
    stock_sentiment = models.FloatField(default=0)
    symbol_count = models.IntegerField(default=0)
    symbol_frequency = models.FloatField(default=0)
    def __unicode__(self):
        return u'%s at time %s' % (self.symbol, self.created_at)
    class Meta:
        db_table = 'stock_sentiment'
        ordering = ['-symbol_count','symbol','-created_at']


