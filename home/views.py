from django.shortcuts import render, render_to_response
from . models import events
# Create your views here.

def index(request):
    return render(request, 'index.html')

def about(request):

    return render_to_response('about.html', {'events' : events.objects.all()})