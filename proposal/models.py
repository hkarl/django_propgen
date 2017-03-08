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
class Textblock(reorderhelper.models.ReorderableMixin,
    models.Model):

    name = models.CharField(
        verbose_name="Short name of the textblock",
        help_text="This name is used to refer to the textblock in templates",
        max_length=64,
    )

    description = models.TextField(
        verbose_name="Brief description",
        help_text="Provide a brief description of this block;"
        "leave empty if clear; does not end up in output"
    )

    filename = models.CharField(
        verbose_name="Filename for the content of the textblock",
        help_text="Provide a filename if you want the content of "
        "this textblock to written to a markdown file. If empty, "
        "no file is produced automatically; content has to be used "
        "in a template explicitly, then.",
        max_length=64,
        blank=True, null=True,
    )

    textblock = MarkdownxField(
        verbose_name="Actual text",
        help_text="Actual text for this block, in Markdown format"
    )

    def __str__(self):
        return "{} {}".format(
            self.name,
            ("({})".format(self.description[0:50])
             if self.description else ""),
        )


@reversion.register()
class Partner(reorderhelper.models.ReorderableMixin,
                  models.Model):


    partnername = models.CharField(max_length=255)
    shortname = models.CharField(max_length=80)
    description = MarkdownxField()
    country = models.CharField(max_length=3)

    PMcost = models.FloatField()

    dictkey = "shortname"

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

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']


class ProducableTypes(models.Model):
    short = models.CharField(max_length=10)
    long = models.CharField(max_length=200,
                            blank=True, null=True)
    comments = models.TextField(blank=True)


class DisseminationTypes(models.Model):
    short = models.CharField(max_length=10)
    long = models.CharField(max_length=200,
                            blank=True, null=True)
    comments = models.TextField(blank=True)


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

    type = models.ForeignKey(ProducableTypes)
    dissemination = models.ForeignKey(DisseminationTypes)

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


    def __str__(self):
        return "{} for task {}: {}".format(
            self.partner,
            self.task,
            self.effort
        )

@reversion.register()
class DeliverablePartnerTaskPM(models.Model):
    partner = models.ForeignKey(Partner)
    deliverable = models.ForeignKey(Deliverable)
    task = models.ForeignKey(Task)

    effort = models.DecimalField(max_digits=6,
                                 decimal_places=2)

    def __str__(self):
        return "{} @ del. {} for task {}: {}".format(
            self.partner,
            self.deliverable,
            self.task,
            self.effort
        )

    class Meta:
        verbose_name = "PM per partner, per task, per deliverable"

@reversion.register()
class MilestonePartnerTaskPM(models.Model):
    partner = models.ForeignKey(Partner)
    milestone = models.ForeignKey(Milestone)
    task = models.ForeignKey(Task)

    effort = models.DecimalField(max_digits=6,
                                 decimal_places=2)


    def __str__(self):
        return "{} @ MS {} for task {}: {}".format(
            self.partner,
            self.milestone,
            self.task,
            self.effort
        )


@reversion.register()
class Project(
    models.Model):

    title = models.CharField(verbose_name="Project title",
                             max_length=512,
                             )

    shortname = models.CharField(verbose_name="Project short name or acronym",
                                     max_length=128)

    lead = models.ForeignKey(Partner,
                             verbose_name="Project coordinator",
                             blank=True, null=True,
                             )

    duration = models.PositiveIntegerField(verbose_name="Project duration (in months)")



@reversion.register()
class Setting(models.Model):
    group = models.CharField(verbose_name="Settings group",
                             max_length=64)

    name = models.CharField(verbose_name="Settings name",
                            max_length=128)

    value = models.CharField(verbose_name="Settings value",
                             max_length=256)

    def __str__(self):
        return "{}.{} = {}".format(self.group, self.name, self.value)

    def get_default(group="", name=""):
        try:
            s = Setting.objects.filter(group__exact=group,
                                       name__startswith=name).first()
            return s.value
        except:
            from django_propgen.settings import default_settings
            # print(default_settings[group])
            return default_settings[group][name]

        return None


@reversion.register()
class Template(models.Model):
    name = models.CharField(
        verbose_name="Name of the produced file",
        help_text="Include extensions like .tex or .md",
        max_length=64)

    description = models.TextField(
        verbose_name="Description",
        help_text="Provide a brief description of what this template does"
    )

    template = models.TextField(
        verbose_name="Actual template text",
        help_text="Use Jinja2-style templates",
        )

    PRODUCE_LATEX = "LA"
    PRODUCE_MARKDOWN = "MD"

    PRODUCTION_TYPES = (
        (PRODUCE_LATEX, "Latex",),
        (PRODUCE_MARKDOWN, "Markdown",),
    )

    startpoint = models.BooleanField(
        verbose_name="Start point",
        help_text="Should this template be offered as a possible "
        "starting point from which to produce PDFs?",
        default=False,

    )

    def __str__(self):
        return (self.name
                if not self.description
                else "{} ({})".format(
                    self.name, self.description[0:50]))

# Make sure that the Reversions ViewSet can find all the relevant models:
import inspect
import sys
revisionhelper.views.ReversionsViewSet.model_list.update(
    dict(inspect.getmembers(sys.modules[__name__], inspect.isclass)))
