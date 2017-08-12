from django.contrib import admin
from .models import events
from .models import gallery

admin.site.register(events)
admin.site.register(gallery)