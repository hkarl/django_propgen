"""Serializers for Django Rest framework"""

import proposal.models
from revisionhelper.serializers import CommentedSerializers

from markdownx.fields import MarkdownxFormField

from rest_framework import serializers

from django_propgen.settings import (
    MARKDOWNX_EDITOR_RESIZABLE,
    MARKDOWNX_URLS_PATH,
    MARKDOWNX_UPLOAD_URLS_PATH,
)

class MarkdownxRestField(serializers.Field,
                             MarkdownxFormField,
                             ):
    
    def __init__(self, *args, **kwargs):
        # Compare: https://github.com/adi-/django-markdownx/blob/master/markdownx/widgets.py

        self.attrs = {}
        self.attrs['class'] = 'form-control markdownx-editor'
        self.attrs['data-markdownx-editor-resizable'] = MARKDOWNX_EDITOR_RESIZABLE
        self.attrs['data_markdownx_urls_path'] = MARKDOWNX_URLS_PATH
        self.attrs['data_markdownx_upload_urls_path'] = MARKDOWNX_UPLOAD_URLS_PATH


        try:
            style = kwargs.pop("style")
        except KeyError:
            style = {}

        style['base_template'] = "markdownx.html"
        style['rows'] = 10
        kwargs['style'] = style

        super().__init__(*args, **kwargs)
                     
    def to_representation(self, obj):
        print("to_repr: {}\n>>{}<<".format(self, obj))
        # return super().to_representation(obj)
        return obj

    def to_internal_value(self, data):
        return data

class SomeModelSerializers(CommentedSerializers):
    class Meta:
        model = proposal.models.SomeModel
        # fields = ('title', 'included', 'comment')
        fields = "__all__"


class PartnertypeSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.Partnertype
        fields = "__all__"

class PartnerSerializer(CommentedSerializers):
    description = MarkdownxFormField()
    class Meta:
        model = proposal.models.Partner
        fields = "__all__"

class WorkpackageSerializer(CommentedSerializers):
    # description = MarkdownxRestField(style={'base_template': 'textarea.html'})
    description = MarkdownxRestField()
    objectives = MarkdownxRestField()
    class Meta:
        model = proposal.models.Workpackage
        fields = ["title", "tag", "type", "lead", "objectives", "description", "id", "order"]

class TaskSerializer(CommentedSerializers):
    description = MarkdownxRestField()
    class Meta:
        model = proposal.models.Task
        fields = "__all__"


class DeliverableSerializer(CommentedSerializers):

    # def create(self, validated_data):
    #     print("===========================\ncreate of DeliverableSerializer")
    #     return super().create(validated_data)
    #
    # def update(self, instance, validated_data):
    #     print("===========================\nupdate of DeliverableSerializer\n{}".format(instance))
    #     return super().update(instance, validated_data)
    #
    # def save(self):
    #     print("===========================\nsave of DeliverableSerializer")
    #     return super().save()
    #
    description = MarkdownxRestField()
    class Meta:
        model = proposal.models.Deliverable
        fields = "__all__"
        
class MilestoneSerializer(CommentedSerializers):
    description = MarkdownxRestField()
    verification = MarkdownxRestField()
    class Meta:
        model = proposal.models.Milestone
        fields = "__all__"

class TaskPartnerPMSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.TaskPartnerPM
        fields = "__all__"

class DeliverablePartnerPMSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.DeliverablePartnerTaskPM
        fields = "__all__"


class MilestonePartnerPMSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.MilestonePartnerTaskPM
        fields = "__all__"
        
class ProjectSerialier(CommentedSerializers):
    class Meta:
        model = proposal.models.Project
        fields = "__all__"


class ProducableTypesSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.ProducableTypes
        fields = "__all__"


class DisseminationTypesSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.DisseminationTypes
        fields = "__all__"

class SettingsSerializer(CommentedSerializers):

    # def to_representation(self, instance):
    #     ret = super().to_representation(instance)
    #     ret['serializercontext'] = 'blub'
    #     # print("serializer context: ", ret)
    #     return ret

    class Meta:
        model = proposal.models.Setting
        fields = "__all__"

class TemplateSerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.Template
        fields = "__all__"


class TextblockSerializer(CommentedSerializers):
    textblock = MarkdownxRestField()
    class Meta:
        model = proposal.models.Textblock
        fields = "__all__"

class BibliographySerializer(CommentedSerializers):
    class Meta:
        model = proposal.models.Bibliography
        fields = "__all__"
