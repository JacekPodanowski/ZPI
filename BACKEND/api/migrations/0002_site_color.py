# Generated migration for adding color index field to Site model

from django.db import migrations, models


def set_default_color_indices(apps, schema_editor):
    """Set default color indices for existing sites based on their creation order."""
    Site = apps.get_model('api', 'Site')
    
    sites = Site.objects.all().order_by('created_at')
    for index, site in enumerate(sites):
        # Assign color index cyclically (0-11 for 12 colors)
        site.color_index = index % 12
        site.save(update_fields=['color_index'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='site',
            name='color_index',
            field=models.IntegerField(
                default=0,
                help_text='Index of the site color in the palette (0-11)'
            ),
        ),
        migrations.RunPython(set_default_color_indices, reverse_code=migrations.RunPython.noop),
    ]
