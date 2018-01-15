from datetime import date, datetime
from django.shortcuts import render, render_to_response, get_object_or_404
from .models import events
from .models import gallery
# Create your views here.

def index(request):
    event = events.objects.filter(start_date__gte=datetime.now()).order_by('start_date')[:5]
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

def gallery_images(request):
    return render(request, 'gallery.html', {'images':gallery.objects.all()})

def event_page_base(request, event_id):
    event = get_object_or_404(events, pk=event_id)
    return render(request, 'event_page_base.html', {'events':event})