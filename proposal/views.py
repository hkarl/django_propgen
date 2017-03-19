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
import re
from pprint import pprint as pp


class SomeModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.SomeModelSerializers
    model_class = proposal.models.SomeModel
    list_template = "SomeModelTemplate.html"
    detail_template = "SomeModel_DetailTemplate.html"
    form_template = "SomeModel_FormTemplate.html"

class PartnertypeModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.PartnertypeSerializer
    model_class = proposal.models.Partnertype


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

    # def get_renderer_context(self):
    #     context = super().get_renderer_context()
    #     context['bla'] = "ksjdfksdhf"
    #     # print("setting view context: ", context)
    #     return context
    #
    # def get_serializer_context(self):
    #     context = super().get_serializer_context()
    #     # groups = proposal.models.Setting.values('group').distinct()
    #     # context['names'] = []
    #     # for g in groups:
    #     #     tmp = proposal.models.Setting.objects.filter(group=g)
    #     #     context['names'].append((g, tmp,))
    #     context['viewcontext'] = "aha!"
    #     return context

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
        # print("running: {}".format(template.name))
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

        return msg


    def export_textblocks(self):
        """Look at all textblocks, produce md files if requested"""

        template_dir = proposal.models.Setting.get_default('dirs', 'templates')
        latex_dir = proposal.models.Setting.get_default('dirs', 'latex')
        for tb in proposal.models.Textblock.objects.exclude(filename__isnull=True):
            # print("textblock production: ", tb)

            filename = tb.filename
            if filename[-3:] == ".md":
                outdir = template_dir
            elif filename[-4:] == ".tex":
                outdir = latex_dir
            else:
                filename += ".md"
                outdir = template_dir

            with open(os.path.join(outdir,
                                   filename),
                      'w') as fp:
                fp.write(tb.textblock)


    def get_context_data(self, **kwargs):
        # print (kwargs)
        r = {}

        template_dir = proposal.models.Setting.get_default('dirs', 'templates')
        latex_dir = proposal.models.Setting.get_default('dirs', 'latex')

        # ensure that directory exists
        os.makedirs(template_dir, mode=0o700, exist_ok=True)

        if 'pk' in kwargs:
            try:
                pk = int(kwargs.pop('pk'))
                template = proposal.models.Template.objects.get(pk=int(pk))
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
            outdir = latex_dir if t.name[-4:] == ".tex" else template_dir
            # print("template: ", t, outdir)
            tmp = self.execute_template(
                t, jh, dir=outdir)

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
            # print("----------------------------")
            # print(t)
            r[t.name] = "ok"
            latex = pypandoc.convert_file(
                t.as_posix(),
                'latex',
                format="md",
                # outputfile=os.path.join(
                #     latex_dir,
                #     t.with_suffix('.tex').name),
                extra_args=['--chapters', ],
            )
            latex = re.sub(r"\\includegraphics(\[.*\]){/media", r"\includegraphics\1{media", latex)
            # print(latex)

            output_file = os.path.join(
                    latex_dir,
                    t.with_suffix('.tex').name)
            # print(output_file)
            with open(output_file,
                    "w") as fp:
                fp.write(latex)


        return {'results': r}

    def get_context_data(self, **kwargs):
        r = self.run_pandoc()
        r.update(super().get_context_data(**kwargs))

        return r
    
