from django.shortcuts import render
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404

import reversion

from rest_framework import viewsets
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route


def format_capture(fct):
    """A decorator to easily intercept 
    calls to non-html renderers.

    Inspect request path; if it contains format, then 
    call supercalls. If not, call the decorated function, 
    which therefore only has to deal with HTML output. 

    Perhaps doable in a much simpler fashio with 
    better understanding of the REST framework?"""
    def _mysuperfct(o, f):
        for c in type(o).__mro__:
            if c == type(o):
                continue
            if f in c.__dict__:
                return c.__dict__[f]
        else:
            return None

    def _f_c(*args, **kwargs):
        request = args[1]
        if 'format' not in request._request.get_full_path():
            return fct(*args, **kwargs)
        else:
            self = args[0]
            callfct = _mysuperfct(self, fct.__name__)
            print(callfct)
            return callfct(*args, **kwargs)

    return _f_c





class FormModelViewSet(reversion.views.RevisionMixin,
                           viewsets.ModelViewSet):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print(self, type(self))
        try:
            mc = type(self).model_class
            print(mc, mc.__name__)
        except Exception:
            print("FormModelViews really should set model_class")
        else:
            if not hasattr(type(self), 'template_name'):
                self.template_name = mc.__name__ + "_Form.html"
            if not hasattr(type(self), 'list_template'):
                self.list_template = mc.__name__ + "_List.html"
            if not hasattr(type(self), 'detail_template'):
                self.detail_template = mc.__name__ + "_Detail.html"
            if not hasattr(type(self), 'form_template'):
                self.form_template = mc.__name__ + "_Form.html"
            
    def get_queryset(self):
        return self.model_class.objects.all()

    def get_list_url(self):
        try:
            url = self.success_url
        except AttributeError:
            url = self.model_class.__name__.lower() + '-list'
        return url

    @list_route(methods=['get', 'post'])
    def add(self, request):
        print("add request", request)
        response_dict = self.get_modelname(request)
        
        if request._request.method == "GET":
            serializer = self.serializer_class()
            response_dict.update({'serializer': serializer, })
            resp = Response(response_dict,
                            template_name=self.form_template)
            return resp

        elif request._request.method == "POST":
            print("in post")

            # this was a considerable bug:
            # obj = self.model_class()
            # serializer = self.serializer_class(obj, data=request.data)
            # the following is the correct code - important to let the
            # serializer create the object; else, m2m fields are not
            # treated correctly
            serializer = self.serializer_class(data=request.data)
            response_dict.update({'serializer': serializer, })
            if not serializer.is_valid():
                return Response(response_dict,
                                template_name=self.form_template)

            try:
                comment = serializer.validated_data['comment']
            except KeyError:
                pass
            else:
                reversion.set_comment(comment)

            serializer.save()

        url = self.get_list_url()
        print("redirect after add: ", url)
        return redirect(url)

    
    @detail_route(methods=['get', 'post'])
    def form(self, request, pk=None):

        response_dict = self.get_modelname(request)
        
        if request._request.method == "GET":
            sm = get_object_or_404(self.model_class, pk=pk)
            serializer = self.serializer_class(sm)
            response_dict.update({'serializer': serializer,
                             'object': sm})
            resp = Response(response_dict,
                            template_name=self.form_template)
            # print("returning: ", sm, serializer)
            return resp

        elif request._request.method == "POST":
            print("in post")
            sm = get_object_or_404(self.model_class, pk=pk)
            serializer = self.serializer_class(sm, data=request.data)
            if not serializer.is_valid():
                response_dict.update({'serializer': serializer,
                                          'object': sm})
                return Response(response_dict,
                                template_name=self.form_template)

            print(serializer.validated_data)
            
            # with reversion.create_revision():
                # reversion.set_user(request.user)
                # reversion.set_comment("Created revision")
            try:
                comment = serializer.validated_data['comment']
            except KeyError:
                pass
            else:
                reversion.set_comment(comment)
            
            serializer.save()

        # TODO: add a warning message here that no proper action
        # has been requested
        url = self.get_list_url()
        return redirect(url)

    def get_modelname(self, *args, **kwargs):
        context = {}
        try:
            mn = ""
            mn = self.model_class.model_name
        except AttributeError:
            mn = self.model_class.__name__
        finally:
            context['modelname'] = mn
        return context

    @format_capture
    def list(self, request):
        try:
            d = {'object_list': self.get_queryset()}
            c = self.get_modelname(request)
            d.update(c)
        except Exception as e:
            print("something wrong", e)

        print("list: ", d, c)

        return Response(d,
                        template_name=self.list_template)


    @format_capture
    def retrieve(self, request, pk=None):
        # print("my retrieve: ", pk, request)
        d = {'sm': self.get_queryset().get(pk=pk)}
        d.update(self.get_modelname(self, request))
        return Response(d,
                        template_name=self.detail_template)
