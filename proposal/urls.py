from pprint import pprint as pp

# rest-framework based routes:
from rest_framework_nested import routers

from revisionhelper.views import ReversionsViewSet
import proposal.views
import resthelper.views

# let's try to generate all the standard routes
# automatically from the views, DRY

import inspect
import sys

views = inspect.getmembers(
    proposal.views, 
    lambda c: inspect.isclass(c) and
              issubclass(c,
                         resthelper.views.FormModelViewSet) and
              c is not resthelper.views.FormModelViewSet
    )
# print(views)

router = routers.SimpleRouter()
vrouters = []
for vname, vclass in views:
    router.register(vclass.model_class.__name__,
                    vclass,
                    base_name=vclass.model_class.__name__.lower(),
                    )
    version_router = routers.NestedSimpleRouter(
        router,
        vclass.model_class.__name__,
        lookup=vclass.model_class.__name__,
    )

    version_router.register(
        r'Version',
        ReversionsViewSet,
        base_name=vclass.model_class.__name__.lower() + "-versions",
        )

    vrouters.append(version_router)
    
# serious views

# so this does not work; need to check how to make this REST:
# router.register("execute/",
#                 proposal.views.ExecuteTemplates.as_view(),
#                 "execute")
#
# pp(router.get_urls())

from django.conf.urls import url, include

urlpatterns =  [
    url(r'^execute/(?P<pk>\d+)/', proposal.views.ExecuteTemplates.as_view()),
    url(r'^execute/', proposal.views.ExecuteTemplates.as_view()),
    url(r'^createLatex/$', proposal.views.CreateLatex.as_view()),
]
