# Generated by Django 3.0.4 on 2020-03-24 23:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('officehours_api', '0007_meeting_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendee',
            name='deleted',
            field=models.DateTimeField(editable=False, null=True),
        ),
    ]
