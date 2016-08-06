# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('symbol', models.CharField(max_length=10)),
                ('stock_name', models.CharField(max_length=100)),
                ('latest_price', models.FloatField(default=1)),
                ('avg_volume', models.FloatField(default=1)),
            ],
            options={
                'db_table': 'stock',
            },
        ),
        migrations.CreateModel(
            name='Stock_price',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('trading_day', models.DateTimeField()),
                ('high_price', models.FloatField(default=1)),
                ('low_price', models.FloatField(default=1)),
                ('open_price', models.FloatField(default=1)),
                ('close_price', models.FloatField(default=1)),
                ('volume', models.IntegerField(default=1)),
                ('stock', models.ForeignKey(to='sentiment.Stock')),
            ],
            options={
                'db_table': 'stock_price',
            },
        ),
        migrations.CreateModel(
            name='Stock_sentiment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('symbol', models.CharField(max_length=10)),
                ('created_at', models.DateTimeField()),
                ('window', models.IntegerField(default=60)),
                ('stock_sentiment', models.FloatField(default=0)),
                ('symbol_count', models.IntegerField(default=0)),
                ('symbol_frequency', models.FloatField(default=0)),
                ('stock', models.ForeignKey(to='sentiment.Stock')),
            ],
            options={
                'ordering': ['-symbol_count', 'symbol', '-created_at'],
                'db_table': 'stock_sentiment',
            },
        ),
        migrations.CreateModel(
            name='Stock_status',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('status_id', models.BigIntegerField(db_index=True)),
                ('analyst_id', models.BigIntegerField(db_index=True)),
                ('created_at', models.DateTimeField()),
                ('tracked_at', models.DateTimeField()),
                ('status_text', models.CharField(max_length=200)),
                ('status_sentiment', models.FloatField(default=0)),
                ('retweet_count', models.IntegerField(default=60)),
                ('favorite_count', models.IntegerField(default=60)),
                ('stock', models.ForeignKey(to='sentiment.Stock')),
            ],
            options={
                'db_table': 'stock_status',
            },
        ),
    ]
