# Generated by Django 3.0.4 on 2020-03-20 02:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('officehours_api', '0002_auto_20200319_1016'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attendee',
            name='meeting',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='officehours_api.Meeting'),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='queue',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='officehours_api.Queue'),
        ),
    ]