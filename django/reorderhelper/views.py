"""Ease dealing with reordering in a REST framework context."""


from django.shortcuts import render

from rest_framework.decorators import detail_route, list_route
from django.views.generic.detail import SingleObjectMixin
from django.shortcuts import redirect
from rest_framework.response import Response
from reorderhelper.serializers import ReorderableSerializer


class ReorderMixin(SingleObjectMixin):
    """Adding up/down actions """

    def get_redirect_url(self, *args, **kwargs):
        try:
            r = super().get_redirect_url(self, *args, **kwargs)
        except AttributeError:
            r = self.model_class.__name__.lower() + '-list'
        except Exception:
            r = "/"

        return redirect(r)


    @detail_route(methods=['GET'])
    def up(self, request, pk, *args, **kwargs):
        obj = self.get_object()
        print("up: ", pk, request, obj)

        try:
            obj.up()
        except AttributeError:
            print("Obj has no up method")

        redirect = self.get_redirect_url(self, *args, **kwargs)
        return redirect

    @detail_route(methods=['GET'])
    def down(self, request, pk, *args, **kwargs):
        obj = self.get_object()
        print("down A: ", pk, request, obj)

        try:
            obj.down()
        except AttributeError:
            print("Obj has no down method")


        print("down B: ", pk, request, obj)
        
        redirect = self.get_redirect_url(self, *args, **kwargs)
        return redirect

    @list_route(methods=['PATCH'])
    def order(self, request, *args, **kwargs):
        """
        Since bulk updating is not supported by Django REST Framework we make our own niche here.
        Only allow partial updates (id, order), so we do not depend on any other serializer.
        """
        serializer = ReorderableSerializer(self.filter_queryset(self.get_queryset()), data=request.data, partial=True,
                                           many=True, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
