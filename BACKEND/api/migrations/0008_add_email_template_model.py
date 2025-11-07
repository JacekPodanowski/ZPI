# Generated manually for EmailTemplate model
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_termsofservice_file'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Template name for display', max_length=255)),
                ('slug', models.SlugField(help_text='Unique identifier for the template', max_length=255, unique=True)),
                ('category', models.CharField(choices=[('booking_confirmation', 'Booking Confirmation'), ('booking_cancellation', 'Booking Cancellation'), ('account_registration', 'Account Registration'), ('site_status', 'Site Status'), ('plan_change', 'Plan Change'), ('subscription_reminder', 'Subscription Reminder')], help_text='Template category', max_length=50)),
                ('subject_pl', models.CharField(help_text='Email subject in Polish', max_length=255)),
                ('subject_en', models.CharField(help_text='Email subject in English', max_length=255)),
                ('content_pl', models.TextField(help_text='HTML email content in Polish')),
                ('content_en', models.TextField(help_text='HTML email content in English')),
                ('is_default', models.BooleanField(default=False, help_text='Is this a default system template?')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(blank=True, help_text='Owner of custom template (null for default templates)', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='email_templates', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['category', '-is_default', 'name'],
            },
        ),
        migrations.AddIndex(
            model_name='emailtemplate',
            index=models.Index(fields=['owner', 'category'], name='api_emailte_owner_i_7f3f4f_idx'),
        ),
        migrations.AddIndex(
            model_name='emailtemplate',
            index=models.Index(fields=['slug'], name='api_emailte_slug_a4b5c6_idx'),
        ),
    ]
