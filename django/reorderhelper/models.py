from django.db import models

from adminsortable.models import SortableMixin


class Reordarable(object):
    def __init__(self, **kwargs):
        for field in ('id', 'order'):
            setattr(self, field, kwargs.get(field, None))


class ReorderableMixin(SortableMixin):
    """Extends Sortable Mixin by up/down functions
    to swap an element with its predecessor/successor.
    Does not do anything if at the corresponding end."""

    order = models.PositiveIntegerField(
        verbose_name="Determine processing order in output",
        default=0,
        editable=False,
        db_index=True,
    )


    def updown(self, neighbor):
        if neighbor:
            order_field = self._meta.ordering[0]

            myorder = getattr(self, order_field)
            neighbororder = getattr(neighbor, order_field)

            setattr(neighbor, order_field, myorder)
            setattr(self, order_field, neighbororder)

            neighbor.save()
            self.save()

    def up(self):
        neighbor = self.get_previous()
        self.updown(neighbor)

    def down(self):
        neighbor = self.get_next()
        self.updown(neighbor)

    def __str__(self):
        return "order: " + str(self.order)
        
    class Meta:
        ordering = ['order']
        abstract = True
