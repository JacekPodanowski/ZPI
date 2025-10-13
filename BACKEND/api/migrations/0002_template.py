from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('template_config', models.JSONField(default=dict)),
                ('thumbnail_url', models.URLField(blank=True, null=True)),
                ('is_public', models.BooleanField(default=True)),
            ],
        ),
    ]
