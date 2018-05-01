from rest_framework import serializers
import inspect
from rest_framework.exceptions import ValidationError
from reorderhelper.models import Reordarable


class ReorderableListSerializer(serializers.ListSerializer):
    def update(self, instance, validated_data):
        id_attr = 'id'
        # since read-only fields are stripped out we have to re-add 'id'

        all_validated_data_by_id = {
            i.pop(id_attr): i
            for i in validated_data
        }

        if not all((bool(i) and not inspect.isclass(i)
                    for i in all_validated_data_by_id.keys())):
            raise ValidationError('')

        objects_to_update = instance.filter(**{
            '{}__in'.format(id_attr): all_validated_data_by_id.keys()
        })

        if len(all_validated_data_by_id) != objects_to_update.count():
            raise ValidationError('Could not find all objects to update.')

        updated_objects = []

        for obj in objects_to_update:
            obj_id = getattr(obj, id_attr)
            obj_validated_data = all_validated_data_by_id.get(obj_id)
            updated_objects.append(self.child.update(obj, obj_validated_data))

        return updated_objects


class ReorderableSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order = serializers.IntegerField()

    def update(self, instance, validated_data):
        setattr(instance, 'order', validated_data['order'])
        instance.save()
        return instance

    def create(self, validated_data):
        return Reordarable(id=None, **validated_data)

    def to_internal_value(self, data):
        ret = super(ReorderableSerializer, self).to_internal_value(data)

        # super removes the 'id' field, re-add it
        ret['id'] = self.fields['id'].get_value(data)

        return ret

    class Meta:
        list_serializer_class = ReorderableListSerializer
        fields = ['id', 'order']
