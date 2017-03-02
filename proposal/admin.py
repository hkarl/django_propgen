from django.contrib import admin

# Register your models here.
from proposal.models import Workpackage

class WorkpackageAdmin(admin.ModelAdmin):
    pass

admin.site.register(Workpackage, WorkpackageAdmin)

