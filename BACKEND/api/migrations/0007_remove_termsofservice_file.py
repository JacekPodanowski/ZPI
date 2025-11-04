# Generated manually to remove legacy 'file' column

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_termsofservice_content_md'),
    ]

    operations = [
        migrations.RunSQL(
            sql='ALTER TABLE api_termsofservice DROP COLUMN IF EXISTS file;',
            reverse_sql='-- No reverse operation',
        ),
    ]
