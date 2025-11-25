# Generated migration for adding publication and subdomain fields to Site model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_alter_emailtemplate_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='site',
            name='subdomain',
            field=models.CharField(
                blank=True,
                editable=False,
                help_text='Auto-generated subdomain (e.g., 1234-nazwa.youreasysite.com)',
                max_length=255,
                null=True,
                unique=True
            ),
        ),
        migrations.AddField(
            model_name='site',
            name='is_published',
            field=models.BooleanField(
                default=False,
                help_text='Whether this site is published and publicly accessible'
            ),
        ),
        migrations.AddField(
            model_name='site',
            name='published_at',
            field=models.DateTimeField(
                blank=True,
                help_text='When the site was first published',
                null=True
            ),
        ),
    ]
