from django.conf import settings
from django.db import migrations, models
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_create_default_email_templates'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='site',
            name='version_history',
        ),
        migrations.CreateModel(
            name='SiteVersion',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('version_number', models.PositiveIntegerField()),
                ('template_config', models.JSONField(blank=True, default=dict)),
                ('notes', models.CharField(blank=True, max_length=500)),
                ('change_summary', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name='created_site_versions', to=settings.AUTH_USER_MODEL)),
                ('site', models.ForeignKey(on_delete=models.CASCADE, related_name='versions', to='api.site')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='siteversion',
            constraint=models.UniqueConstraint(fields=('site', 'version_number'), name='unique_site_version_per_site'),
        ),
    ]
