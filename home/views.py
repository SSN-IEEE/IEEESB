from datetime import date, datetime

from django.shortcuts import render, render_to_response
from . models import events
# Create your views here.

def index(request):
    event = events.objects.filter(start_date__lte=datetime.now()).order_by('start_date')[:5]
    return render_to_response('index.html', {'events': event})

def about(request):

    return render_to_response('about.html', {'events' : events.objects.all()})

def past_events(request):
    event = events.objects.filter(start_date__lt = datetime.now()).order_by('-start_date')
    return render_to_response('past_events.html', {'events' : event})

def upcoming_events(request):
    event = events.objects.filter(start_date__gte = datetime.now()).order_by('start_date')
    return render_to_response('upcoming_events.html', {'events' : event})

def contact(request):
    return render(request, 'contact.html')

def gallery(request):
    return render(request, 'gallery.html')