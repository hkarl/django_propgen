from django.shortcuts import get_object_or_404, get_list_or_404
from django.views.generic import RedirectView, View
from django.http import JsonResponse
from django.views.generic.base import ContextMixin, TemplateResponseMixin

import proposal.models
import proposal.serializers
from resthelper.views import FormModelViewSet 
from reorderhelper.views import ReorderMixin
from proposal.jinjaHandler import JinjaHandler, PropgenTemplateException

# automatically generate the main ModelViewSets

import pypandoc
import pathlib

import os
import shutil
import tarfile
import re
import subprocess


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

class BibliographyModelViewSet(FormModelViewSet, ReorderMixin):
    serializer_class = proposal.serializers.BibliographySerializer
    model_class = proposal.models.Bibliography


##########################################
# Serious views below

class ExecutionView(TemplateResponseMixin, ContextMixin, View):

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        response_kwargs = {'content_type': request.content_type}
        data = self.entrypoint(**kwargs)
        if request.content_type == 'application/json' or \
                ('HTTP_ACCEPT' in request.META and 'application/json' in request.META['HTTP_ACCEPT']):
            return JsonResponse(data)
        context.update(data)
        return self.response_class(
            request=request,
            template=self.get_template_names(),
            context=context,
            using=self.template_engine,
            **response_kwargs
        )

    def entrypoint(self, **kwargs):
        pass


class ExecuteTemplates(ExecutionView):
    template_name = "execute_template.html"

    def get_settings(self):
        self.template_dir = proposal.models.Setting.get_default('dirs', 'templates')
        self.latex_dir = proposal.models.Setting.get_default('dirs', 'latex')


    def export_bibliographies(self):
        r = []
        for bib in proposal.models.Bibliography.objects.filter(filename__endswith=".bib"):
            """TODO: so far, only handle bibtex files"""
            with open(os.path.join(self.latex_dir, bib.filename), 'w') as fp:
                fp.write(bib.bibliography)
            r.append({'obj': {'id': bib.id, 'name': bib.name}, 'result': "written to disk"})
        return r

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
        r = []

        for tb in proposal.models.Textblock.objects.exclude(filename__isnull=True):
            # print("textblock production: ", tb)

            filename = tb.filename
            if filename[-3:] == ".md":
                outdir = self.template_dir
            elif filename[-4:] == ".tex":
                outdir = self.latex_dir
            else:
                filename += ".md"
                outdir = self.template_dir

            with open(os.path.join(outdir,
                                   filename),
                      'w') as fp:
                fp.write(tb.textblock)

            r.append({'obj': {'id': tb.id, 'name': tb.name}, 'result': "written to disk"})

        return r

    def entrypoint(self, **kwargs):
        # print (kwargs)
        r = {'results': []}

        self.get_settings()

        # ensure that directory exists
        os.makedirs(self.template_dir, mode=0o700, exist_ok=True)

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
        r['tbresults'] = self.export_textblocks()
        r['bibresults'] = self.export_bibliographies()

        ############
        jh = JinjaHandler()

        for t in templatelist:
            outdir = self.latex_dir if t.name[-4:] == ".tex" else self.template_dir
            # print("template: ", t, outdir)
            tmp = self.execute_template(
                t, jh, dir=outdir)

            r['results'].append({'obj': {'id': t.id, 'name': t.name}, 'result': tmp})

        ###############

        return r


class CreateLatex(ExecutionView):

    template_name = "create_latex.html"

    def get_settings(self):
        self.template_dir = proposal.models.Setting.get_default('dirs', 'templates')
        self.latex_dir = proposal.models.Setting.get_default('dirs', 'latex')
        self.filters = proposal.models.Setting.get_default('pandoc', 'filters')
        self.extra_args = proposal.models.Setting.get_default('pandoc', 'extra_args')

    def run_pandoc(self):
        r = {}

        # ensure latexdir exists:
        os.makedirs(self.latex_dir, mode=0o700, exist_ok=True)

        # iterate over all md files in templates; run them through pandoc
        p = pathlib.Path(self.template_dir)
        for t in list(p.glob('*.md')):
            # print("----------------------------")
            # print(t)
            r[t.name] = "ok"

            try:

                latex = pypandoc.convert_file(
                    t.as_posix(),
                    'latex',
                    format="md",
                    # outputfile=os.path.join(
                    #     latex_dir,
                    #     t.with_suffix('.tex').name),
                    extra_args=self.extra_args,
                    filters=self.filters,
                )
                latex = re.sub(r"\\includegraphics(\[.*\]){/media", r"\includegraphics\1{media", latex)
            except Exception as e:
                r[t.name] = "Error during pandoc conversion: {}".format(e.__str__())
                latex = "ERROR"

            output_file = os.path.join(
                    self.latex_dir,
                    t.with_suffix('.tex').name)
            # print(output_file)
            with open(output_file,
                    "w") as fp:
                fp.write(latex)


        return {'results': r}

    def entrypoint(self, **kwargs):
        self.get_settings()
        r = self.run_pandoc()
        return r
    
class RunPdflatex(ExecutionView):

    template_name = "pdf.html"

    def get_settings(self):
        self.produced_dir = proposal.models.Setting.get_default('dirs', 'producedmedia')
        self.latex_dir = proposal.models.Setting.get_default('dirs', 'latex')
        self.uploaded_dir = proposal.models.Setting.get_default('dirs', 'uploaded')
        self.templates_dir = proposal.models.Setting.get_default('dirs', 'templates')
        self.tarball = proposal.models.Setting.get_default('dirs', 'tarball')

    def runcommand(self, *args):
        r = {'warning': '', 'result': None, 'exception': '',}
        print(list(args))
        try:
            compProc = subprocess.run(
                list(args),
                universal_newlines=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.latex_dir,
            )

            r['result'] = {'stdout': compProc.stdout, 'stderr': compProc.stderr, 'returncode': compProc.returncode}

        except Exception as e:
            r['exception'] += e.__str__()
        return r

    def bibtex(self, template):
        return self.runcommand('bibtex', template.name[:-4])

    def pdflatex(self, template):
        """Run pdflatex once on given template"""
        return self.runcommand('pdflatex', template.name, '-interaction=nonstopmode')


    def pdflatex_template(self, template):

        r = {'obj': {'id': template.id, 'name': template.name}, 'warning': '', 'result': 'ok'}

        if not template.startpoint:
            r['warning'] += "This template is NOT a startpoint. Unlikely to produce useful results!"

        if not template.name.endswith('.tex'):
            r['warning'] += ("You are trying to run pdflatex on a non-latex template."
                "This is highly unlikely to produce useful results.")
        else:
            r['pdf'] = template.name[:-4]+".pdf"

        if 'pdf' in r:
            # TODO: check that file exists, but it should...

            r.update({'run1': self.pdflatex(template)})
            r.update({'bibtex': self.bibtex(template)})
            # r.update({'run2': self.pdflatex(template)})
            # r.update({'run3': self.pdflatex(template)})
            if not os.path.isfile(os.path.join(self.latex_dir, r['pdf'])):
                r['result'] = 'no file generated'
        else:
            r['result'] = 'error'

        return r

    def link_pdf(self):
        latex_dir = pathlib.Path(self.latex_dir)
        # create symbolic links from media directory to latex dir
        # for produced PDFs

        for d in list(latex_dir.glob('*.pdf')):
            print(d)
            try:
                shutil.copy2(d.as_posix(), self.produced_dir)
            except FileExistsError as e:
                print(e)
                pass
            except Exception as e:
                print(e)

    def produce_tarball(self):

        with tarfile.open(self.tarball, "w:gz") as tarfp:
            tarfp.add(self.latex_dir)
            tarfp.add(self.templates_dir)
            tarfp.add(self.uploaded_dir)




    def entrypoint(self, **kwargs):
        self.get_settings()

        pk = kwargs.pop('pk', None)
        print(pk)
        result = {}

        if pk:
            startfiles = [get_object_or_404(proposal.models.Template,
                                           pk=pk)]
        else:
            startfiles = get_list_or_404(proposal.models.Template,
                                         startpoint=True)

        print(startfiles)

        # go to the right directory; do that once for all templates

        # produce all pdfs
        result['startfiles'] = [self.pdflatex_template(s)
                                for s in startfiles]

        self.link_pdf()
        self.produce_tarball()

        return result


class getNewPdf(RedirectView):

    url = "/" + proposal.models.Setting.get_default('dirs', 'producedmedia')

    def get_redirect_url(self, *args, **kwargs):
        print("In getNewPdf")

        filename = kwargs.get('filename', None)
        if filename:
            template_name = re.sub('.pdf$', '.tex', filename)
            template = get_object_or_404(
                proposal.models.Template,
                name__startswith=template_name,
                startpoint=True
            )

        print("filename: ", filename, template)

        r = {}
        r.update(ExecuteTemplates().entrypoint(**kwargs))
        r.update(CreateLatex().entrypoint(**kwargs))
        r.update(RunPdflatex().entrypoint(pk=template.pk,
                                          **kwargs))

        # TODO: error checking!

        # redir = super().get_redirect_url(url = "/blasdsja", *args, **kwargs)
        redir = self.url + "/" + filename
        print("redirecting: ", redir)
        return redir