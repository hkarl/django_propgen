# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-03-03 14:53
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0010_auto_20170302_1645'),
    ]

    operations = [
        migrations.CreateModel(
            name='Setting',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group', models.CharField(max_length=64, verbose_name='Settings group')),
                ('name', models.CharField(max_length=128, verbose_name='Settings name')),
                ('value', models.CharField(max_length=256, verbose_name='Settings value')),
            ],
        ),
        migrations.AlterField(
            model_name='deliverable',
            name='secondarytasks',
            field=models.ManyToManyField(blank=True, related_name='secondarytasks', to='proposal.Task'),
        ),
    ]
