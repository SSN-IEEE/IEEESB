from django.db import models

class events(models.Model):
    name = models.CharField(max_length=500)
    start_date = models.DateField()
    type = models.IntegerField()
    coord = models.CharField(max_length=500)
    host = models.IntegerField()
    stream = models.IntegerField()
    speakers = models.CharField(max_length=500)
    no_of_participants = models.IntegerField()
    duration = models.IntegerField()
