# Generated manually to introduce media asset tracking models.
from django.db import migrations, models
import django.utils.timezone
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_customreactcomponent'),
    ]

    operations = [
        migrations.CreateModel(
            name='MediaAsset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_name', models.CharField(max_length=255)),
                ('storage_path', models.CharField(max_length=500, unique=True)),
                ('file_url', models.CharField(max_length=500, unique=True)),
                ('file_hash', models.CharField(max_length=64, unique=True)),
                ('media_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video'), ('other', 'Other')], default='other', max_length=16)),
                ('uploaded_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('uploaded_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='uploaded_media', to='api.platformuser')),
            ],
        ),
        migrations.AddIndex(
            model_name='mediaasset',
            index=models.Index(fields=['media_type'], name='api_mediaas_media_t_e252e3_idx'),
        ),
        migrations.AddIndex(
            model_name='mediaasset',
            index=models.Index(fields=['uploaded_at'], name='api_mediaas_upload_0ebc36_idx'),
        ),
        migrations.CreateModel(
            name='MediaUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usage_type', models.CharField(choices=[('avatar', 'Avatar'), ('site_content', 'Site content')], max_length=32)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usages', to='api.mediaasset')),
                ('site', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='media_usages', to='api.site')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='media_usages', to='api.platformuser')),
            ],
        ),
        migrations.AddConstraint(
            model_name='mediausage',
            constraint=models.CheckConstraint(
                check=(
                    (models.Q(site__isnull=False) & models.Q(user__isnull=True)) |
                    (models.Q(site__isnull=True) & models.Q(user__isnull=False))
                ),
                name='mediausage_single_context',
            ),
        ),
        migrations.AddConstraint(
            model_name='mediausage',
            constraint=models.UniqueConstraint(
                fields=['asset', 'site', 'usage_type'],
                condition=models.Q(site__isnull=False),
                name='mediausage_unique_site_usage',
            ),
        ),
        migrations.AddConstraint(
            model_name='mediausage',
            constraint=models.UniqueConstraint(
                fields=['asset', 'user', 'usage_type'],
                condition=models.Q(user__isnull=False),
                name='mediausage_unique_user_usage',
            ),
        ),
    ]
