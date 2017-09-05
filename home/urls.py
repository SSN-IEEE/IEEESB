from home import views
from django.conf.urls import url
from .models import events

app_name = 'home'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^about$', views.about, name='about'),
    url(r'^past_events$', views.past_events, name='past_events?perPage=100'),
    url(r'^upcoming_events$', views.upcoming_events, name='upcoming_events'),
    url(r'^upcoming_events/(?P<event_id>[0-9]+)/$', views.event_page_base, name='details'),
    url(r'^contact$', views.contact, name='contact'),
    url(r'^gallery$', views.gallery_images, name='gallery_images'),
]