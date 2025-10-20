from django.db import migrations, models
import api.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_platformuser_avatar'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomReactComponent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('source_code', models.TextField(blank=True, help_text='Oryginalny kod JSX dla celów edycji')),
                ('compiled_js', models.FileField(blank=True, null=True, upload_to=api.models.custom_component_path)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
