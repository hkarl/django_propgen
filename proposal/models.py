from django.db import models

from markdownx.models import MarkdownxField
from adminsortable.fields import SortableForeignKey

import reversion 

import reorderhelper.models 
import revisionhelper.views

@reversion.register()
class SomeModel(reorderhelper.models.ReorderableMixin,
                    models.Model):
    model_name = "Some model"
    
    title = models.CharField(verbose_name="Descriptive title",
                             blank=True,
                             max_length=80)


    included = models.BooleanField(
        verbose_name="Include this block in ouput"
    )

    def __str__(self):
        return "SomeModel: " + self.title  + super().__str__()
    


@reversion.register()
class Partner(reorderhelper.models.ReorderableMixin,
                  models.Model):
    partnername = models.CharField(max_length=255)
    shortname = models.CharField(max_length=80)
    description = MarkdownxField()
    country = models.CharField(max_length=3)

    PMcost = models.FloatField()

    def __str__(self):
        return "{} ({})".format(self.partnername ,
                                self.shortname)

@reversion.register()
class Workpackage(reorderhelper.models.ReorderableMixin,
                  models.Model):
    title = models.CharField(max_length=255)
    tag = models.CharField(max_length=20)
    objectives = MarkdownxField()
    description = MarkdownxField()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']



@reversion.register()
class Task(reorderhelper.models.ReorderableMixin,
                  models.Model):
    title = models.CharField(max_length=255)
    tag = models.CharField(max_length=20)

    start = models.PositiveIntegerField()
    end = models.PositiveIntegerField()

    description = MarkdownxField()

    wp = SortableForeignKey(Workpackage)
    lead = models.ForeignKey(Partner)

    class Meta:
        ordering = ['order']

@reversion.register()
class Deliverable(reorderhelper.models.ReorderableMixin,
                  models.Model):
    title = models.CharField(max_length=255)
    tag = models.CharField(max_length=20)
    description = MarkdownxField()
    due = models.PositiveIntegerField()
    lead = models.ForeignKey(Partner)
    maintask = models.ForeignKey(Task,
                                 blank=True)
    secondarytasks = models.ManyToManyField(
        Task,
        blank=True,
        related_name="secondarytasks")

    type = models.CharField(max_length=10)
    dissemination = models.CharField(max_length=10)

    wp = SortableForeignKey(Workpackage)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']


@reversion.register()
class Milestone(reorderhelper.models.ReorderableMixin,
                  models.Model):
    title = models.CharField(max_length=255)
    tag = models.CharField(max_length=20)

    description = MarkdownxField()
    due = models.PositiveIntegerField()
    lead = models.ForeignKey(Partner)
    maintask = models.ForeignKey(Task, blank=True)
    secondarytasks = models.ManyToManyField(
        Task,
        related_name="secondaryTasks")

    verification = MarkdownxField()

    wp = SortableForeignKey(Workpackage)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']


@reversion.register()
class TaskPartnerPM(models.Model):
    partner = models.ForeignKey(Partner)
    task = models.ForeignKey(Task)

    effort = models.DecimalField(max_digits=6,
                                 decimal_places=2)

@reversion.register()
class DeliverablePartnerPM(models.Model):
    partner = models.ForeignKey(Partner)
    deliverable = models.ForeignKey(Deliverable)

    effort = models.DecimalField(max_digits=6,
                                 decimal_places=2)


@reversion.register()
class MilestonePartnerPM(models.Model):
    partner = models.ForeignKey(Partner)
    milestone = models.ForeignKey(Milestone)

    effort = models.DecimalField(max_digits=6,
                                 decimal_places=2)

    

    
# Make sure that the Reversions ViewSet can find all the relevant models:
import inspect
import sys
revisionhelper.views.ReversionsViewSet.model_list.update(
    dict(inspect.getmembers(sys.modules[__name__], inspect.isclass)))
