# Generated by Django 4.1.4 on 2025-02-10 10:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_uploadedmusic_music_file_alter_uploadedmusic_table'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Music',
        ),
    ]
