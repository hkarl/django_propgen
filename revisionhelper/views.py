from django.shortcuts import render

from reversion.models import Version
from rest_framework import viewsets
from rest_framework.response import Response

from revisionhelper.serializers import RevisionSerializer

import inspect

# Create your views here.

class ReversionsViewSet(viewsets.ModelViewSet):
    serializer_class = RevisionSerializer
    template_name = "version_list.html"
    model_list = {}
    
    def get_queryset(self, *args, **kwargs):
        print("RVS g_q: ", args, kwargs, self.request)
        return Version.objects.all()
    

    def get_model_pk(self, kwargs):
        _tmp, model_pk = kwargs.popitem()
        model_name = _tmp.split('_')[0]
        # model_class = globals()[model_name]
        model_class = self.model_list[model_name]

        return (model_class, model_pk, model_name)

    def get_template(self, model_class, detail=False):
        try:
            if detail:
                template = model_class.version_template_detail
            else:
                template = model_class.version_template_list
        except AttributeError:
            try:
                template = model_class.version
                if detail:
                    template += "_detail.html"
                else:
                    template += "_list.html"
            except AttributeError:
                if detail:
                    template = "version_detail.html"
                else:
                    template = "version_list.html"

        return template
    
    def list(self, request, *args, **kwargs):
        model_class, model_pk, model_name = self.get_model_pk(kwargs)
        
        print ("RVS list: ", request, args, kwargs, model_pk, model_class)

        # get all the Versions of model_class pk=pk object
        qs = Version.objects.get_for_object_reference(model_class, model_pk)
        print(qs)
        
        return Response({'versions': qs,
                         },
                        template_name=self.get_template(model_class,
                                                            detail=False)
                            )
    
    def retrieve(self, request, pk, *args, **kwargs):
        model_class, model_pk, model_name = self.get_model_pk(kwargs)
        print ("RVS retrieve: ", request, args, kwargs, pk, model_class, model_pk )

        try:
            version = Version.objects.get_for_object_reference(
                model_class, model_pk).get(pk=pk)
            template = self.get_template(model_class,
                                        detail=True)
            print("redirection Version: ", template, version)
            return Response(
                {'version': version},
                template_name=template
                )
        except Exception as e:
            print("no such version", e, type(e))
            url = reverse(model_name.lower()+"-detail",
                            kwargs={'pk': model_pk})
            print("redirecting: ", url)
            # TODO: error message!
            return redirect(url)
        
    
        
    
