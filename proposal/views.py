from django.shortcuts import render
from django.views.generic import TemplateView



import proposal.models 
import proposal.serializers
from resthelper.views import FormModelViewSet 
from reorderhelper.views import ReorderMixin
from proposal.jinjaHandler import JinjaHandler, PropgenTemplateException

# automatically generate the main ModelViewSets

import pypandoc
import pathlib

import inspect
import sys
import os
from pprint import pprint as pp


class SomeModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.SomeModelSerializers
    model_class = proposal.models.SomeModel
    list_template = "SomeModelTemplate.html"
    detail_template = "SomeModel_DetailTemplate.html"
    form_template = "SomeModel_FormTemplate.html"

class PartnerModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.PartnerSerializer
    model_class = proposal.models.Partner


class WorkpackageModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.WorkpackageSerializer
    model_class = proposal.models.Workpackage


class TaskModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.TaskSerializer
    model_class = proposal.models.Task


class DeliverableModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.DeliverableSerializer
    model_class = proposal.models.Deliverable


class MilestoneModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.MilestoneSerializer
    model_class = proposal.models.Milestone

class ProjectModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.ProjectSerialier
    model_class = proposal.models.Project


class ProducableTypesModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.ProducableTypesSerializer
    model_class = proposal.models.ProducableTypes

class DisseminationTypesModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.DisseminationTypesSerializer
    model_class = proposal.models.DisseminationTypes


# not sure about these;
# probably better incorporated into the various Task/deliverable/Milestone
# views and templates? 

class TaskPartnerPMModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.TaskPartnerPMSerializer
    model_class = proposal.models.TaskPartnerPM


class DeliverablePartnerPMModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.DeliverablePartnerPMSerializer
    model_class = proposal.models.DeliverablePartnerTaskPM


class MilestonePartnerPMModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.MilestonePartnerPMSerializer
    model_class = proposal.models.MilestonePartnerTaskPM
    
class SettingsModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.SettingsSerializer
    model_class = proposal.models.Setting

class TemplateModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.TemplateSerializer
    model_class = proposal.models.Template

class TextblockModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.TextblockSerializer
    model_class = proposal.models.Textblock


##########################################
# Serious views below


class ExecuteTemplates(TemplateView):
    template_name = "execute_template.html"

    def execute_template(self, template, jh, dir=""):
        print("running: {}".format(template.name))
        try:
            output = jh.render(template)
            msg = "ok"
        except PropgenTemplateException as e:
            output = "ERROR occured: " + e.message
            msg = e.message
        finally:
            with open(os.path.join(
                    dir,
                    template.name), 'w') as fp:
                fp.write(output)


        # TODO: write in outputfile

    def export_textblocks(self):
        """Look at all textblocks, produce md files if requested"""

        template_dir = proposal.models.Setting.get_default('dirs', 'templates')
        for tb in proposal.models.Textblock.objects.exclude(filename__isnull=True):
            print("textblock production: ", tb)

            filename = tb.filename
            if not filename[-3:] == ".md":
                filename += ".md"

            with open(os.path.join(template_dir,
                                   filename),
                      'w') as fp:
                fp.write(tb.textblock)


    def get_context_data(self, **kwargs):
        print (kwargs)
        r = {}

        template_dir = proposal.models.Setting.get_default('dirs', 'templates')

        # ensure that directory exists
        os.makedirs(template_dir, mode=0o700, exist_ok=True)

        if 'pk' in kwargs:
            try:
                pk = int(kwargs.pop('pk'))
                template = proposal.models.Template.objects.get(int())
                templatelist = [template]
            except:
                from django.core.exceptions import ObjectDoesNotExist
                raise ObjectDoesNotExist
        else:
            templatelist = proposal.models.Template.objects.all()


        ############
        self.export_textblocks()

        ############
        jh = JinjaHandler()

        for t in templatelist:
            print("template: ", t)
            tmp = self.execute_template(t, jh,
                                        dir=template_dir)
            r[t.name] = tmp

        ###############
        r.update(super().get_context_data(**kwargs))

        return r


class CreateLatex(TemplateView):

    template_name = "create_latex.html"


    def run_pandoc(self):
        r = {}
        template_dir = proposal.models.Setting.get_default('dirs', 'templates')
        latex_dir = proposal.models.Setting.get_default('dirs', 'latex')

        # ensure latexdir exists:
        os.makedirs(latex_dir, mode=0o700, exist_ok=True)

        # iterate over all md files in templates; run them through pandoc
        p = pathlib.Path(template_dir)
        for t in list(p.glob('*.md')):
            r[t.name] = "ok"
            pypandoc.convert_file(
                t.as_posix(),
                'latex',
                format="md",
                outputfile=os.path.join(
                    latex_dir,
                    t.with_suffix('.tex').name),
                extra_args=['--chapters', ],
            )
            print(t)

        return {'results': r}

    def get_context_data(self, **kwargs):
        r = self.run_pandoc()
        r.update(super().get_context_data(**kwargs))

        return r
    
