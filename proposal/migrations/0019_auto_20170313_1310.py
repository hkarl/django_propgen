# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-03-13 13:10
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0018_auto_20170313_1057'),
    ]

    operations = [
        migrations.AddField(
            model_name='workpackage',
            name='lead',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='proposal.Partner'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workpackage',
            name='type',
            field=models.CharField(default='RTD', help_text='Type of the WP, according to predefined EU list', max_length=10, verbose_name='WP Type (RTD, MGMT, ...)'),
        ),
    ]
