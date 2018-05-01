# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-03-08 08:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0012_template'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='description',
            field=models.TextField(default='', help_text='Provide a brief description of what this template does', verbose_name='Description'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='template',
            name='template',
            field=models.TextField(help_text='Use Jinja2-style templates', verbose_name='Actual template text'),
        ),
    ]