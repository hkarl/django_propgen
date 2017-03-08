from django.shortcuts import render




import proposal.models 
import proposal.serializers
from resthelper.views import FormModelViewSet 
from reorderhelper.views import ReorderMixin 

# automatically generate the main ModelViewSets

import inspect
import sys


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


    
