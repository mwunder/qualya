from django.core.management.base import BaseCommand, CommandError
from sentiment.models import *

class Command(BaseCommand):
    help = 'use the model in estimate_sentiment to estimate sentiment'

    def add_arguments(self, parser):
        parser.add_argument('poll_id', nargs='+', type=int)

    def handle(self, *args, **options):
        import pandas_stock_reader 

