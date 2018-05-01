"""Seralizers to help with revision handling. 
Goal is easier integration into the Django Rest framework."""


from rest_framework import serializers

import reversion.models 

class CommentedSerializers(serializers.ModelSerializer):
    """Subclass serializers for ordinary models from 
    this serializer to have a comment field available. 
    Will be used when saving changes."""
    comment = serializers.CharField(required=False)


class ReversionRevisionSerializer(serializers.ModelSerializer):
    """
    This serializer handles the serialization of a specific revision
    """
    class Meta:
        model = reversion.models.Revision
        fields = '__all__'


class RevisionSerializer(serializers.ModelSerializer):
    """This serializer is used to display version lists.
    Compare views.py
    """
    revision = ReversionRevisionSerializer()

    class Meta:
        model = reversion.models.Version
        fields = '__all__'
