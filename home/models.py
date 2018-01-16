from django.db import models

class events(models.Model):
    name = models.CharField(max_length=500)
    start_date = models.DateField()
    type = models.IntegerField()
    coord = models.CharField(max_length=500, default='NIL')
    host = models.IntegerField()
    stream = models.IntegerField()
    speakers = models.CharField(max_length=500, default='NIL')
    no_of_participants = models.IntegerField(default=-1)
    duration = models.IntegerField()
    brochure_link = models.CharField(max_length=300, default='NIL')
    schedule_link = models.CharField(max_length=300, default='NIL')
    event_photo = models.CharField(max_length=100, default='NIL')
    scope = models.CharField(max_length=1000, default='NIL')
    objective = models.CharField(max_length=1000, default='NIL')
    perks = models.CharField(max_length=1000, default='NIL')
    registration_link = models.CharField(max_length=1000, default='NIL')
    registration_fee_ieee = models.FloatField(default=-1)
    registration_fee_non_ieee = models.FloatField(default=-1)
    note = models.CharField(max_length=10000, default='NIL')

    def __str__(self):
        return 'Name :' + self.name

class gallery(models.Model):
    photo_number = models.IntegerField(default=-1)
    title = models.CharField(max_length=100, default='NIL')
    description = models.CharField(max_length=500, default='NIL')