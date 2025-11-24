# Generated migration to remove frequency field from NewsletterSubscription

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_alter_emailtemplate_category'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='newslettersubscription',
            name='frequency',
        ),
    ]
