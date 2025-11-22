# Generated manually for Pexels image search integration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='platformuser',
            name='daily_image_searches',
            field=models.IntegerField(default=0, help_text='Number of Pexels searches performed today'),
        ),
        migrations.AddField(
            model_name='platformuser',
            name='last_search_date',
            field=models.DateField(blank=True, help_text='Date of last Pexels search (for daily reset)', null=True),
        ),
    ]
