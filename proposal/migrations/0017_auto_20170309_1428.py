# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-03-09 14:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0016_project_callobjectives'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='setting',
            options={'ordering': ['group', 'name']},
        ),
        migrations.AddField(
            model_name='setting',
            name='description',
            field=models.TextField(blank=True, help_text='Explain what this setting does, where it is used.', verbose_name='Description of this setting'),
        ),
    ]
