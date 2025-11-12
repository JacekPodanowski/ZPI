# Generated migration to rename avatar field to avatar_url

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_rename_api_emailte_owner_i_7f3f4f_idx_api_emailte_owner_i_7327e9_idx_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='platformuser',
            old_name='avatar',
            new_name='avatar_url',
        ),
    ]
