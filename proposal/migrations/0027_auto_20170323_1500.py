# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-03-23 15:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0026_auto_20170323_1434'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partner',
            name='PMcost',
            field=models.DecimalField(decimal_places=2, default=0.0, help_text='This relates to the Direct Personnel Cost (Col. A) via the number of personmonths', max_digits=8, verbose_name='Person month cost'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='_requested_contribution',
            field=models.DecimalField(decimal_places=2, default=-1.0, help_text='Default negative value means requested contribution equals maximum contribution.Only fill in this field if you want to request less money than the maximum allows you to do. This is usually not recommended.', max_digits=10, verbose_name='Requested contribution'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='finanical_support_3rd',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Financial support for 3rd parties'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='inkind_contributions',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='In-kind contributions'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='other_direct_cost',
            field=models.DecimalField(decimal_places=2, default=-1.0, help_text='Corresponds to Col. B. If negative, the value is computed from other fields!', max_digits=10, verbose_name='Other direct cost'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='reimbursement_rate',
            field=models.DecimalField(decimal_places=2, default=100.0, help_text='Make sure the reimbursement rate is consistent with the partner type', max_digits=5, verbose_name='Reimbursement rate'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='special_uni_cost',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Special unit cost'),
        ),
        migrations.AlterField(
            model_name='partner',
            name='subcontract_cost',
            field=models.DecimalField(decimal_places=2, default=0.0, help_text='Total cost of all subcontracting done by this partner', max_digits=10, verbose_name='Subcontractig cost'),
        ),
    ]