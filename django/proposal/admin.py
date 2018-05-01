from django.contrib import admin

# Register your models here.
from proposal.models import *

class WorkpackageAdmin(admin.ModelAdmin):
    pass

admin.site.register(Workpackage, WorkpackageAdmin)
admin.site.register(Textblock)
admin.site.register(Partner)
admin.site.register(Task)
admin.site.register(ProducableTypes)
admin.site.register(DisseminationTypes)
admin.site.register(Deliverable)
admin.site.register(Milestone)
admin.site.register(TaskPartnerPM)
admin.site.register(DeliverablePartnerTaskPM)
admin.site.register(MilestonePartnerTaskPM)
admin.site.register(Project)
admin.site.register(Setting)
admin.site.register(Template)


