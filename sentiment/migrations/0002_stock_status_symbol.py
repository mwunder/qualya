# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sentiment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='stock_status',
            name='symbol',
            field=models.CharField(default='', max_length=10),
            preserve_default=False,
        ),
    ]
