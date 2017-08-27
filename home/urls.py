from home import views
from django.conf.urls import url

app_name = 'home'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^about$', views.about, name='about'),
    url(r'^past_events$', views.past_events, name='past_events?perPage=100'),
    url(r'^upcoming_events$', views.upcoming_events, name='upcoming_events'),
    url(r'^contact$', views.contact, name='contact'),
    url(r'^gallery$', views.gallery_images, name='gallery_images'),
]