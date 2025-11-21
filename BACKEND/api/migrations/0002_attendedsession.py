from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AttendedSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('host_type', models.CharField(choices=[('owner', 'Owner'), ('team_member', 'Team Member')], max_length=20)),
                ('title', models.CharField(max_length=255)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('duration_minutes', models.PositiveIntegerField()),
                ('recorded_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('source', models.CharField(default='event_snapshot', max_length=32)),
                ('event', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='attended_sessions', to='api.event')),
                ('host_team_member', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='hosted_sessions', to='api.teammember')),
                ('host_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='hosted_sessions', to='api.platformuser')),
                ('site', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attended_sessions', to='api.site')),
            ],
            options={
                'ordering': ['-start_time'],
            },
        ),
        migrations.AddIndex(
            model_name='attendedsession',
            index=models.Index(fields=['site', 'host_type'], name='api_attende_site_id_ho_b707d0_idx'),
        ),
        migrations.AddIndex(
            model_name='attendedsession',
            index=models.Index(fields=['start_time'], name='api_attende_start_ti_84e1ae_idx'),
        ),
        migrations.AddConstraint(
            model_name='attendedsession',
            constraint=models.CheckConstraint(
                check=(
                    (models.Q(host_type='owner') & models.Q(host_user__isnull=False) & models.Q(host_team_member__isnull=True)) |
                    (models.Q(host_type='team_member') & models.Q(host_team_member__isnull=False) & models.Q(host_user__isnull=True))
                ),
                name='attendedsession_host_guard'
            ),
        ),
        migrations.AddConstraint(
            model_name='attendedsession',
            constraint=models.CheckConstraint(check=models.Q(duration_minutes__gte=1), name='attendedsession_positive_duration'),
        ),
        migrations.AddConstraint(
            model_name='attendedsession',
            constraint=models.UniqueConstraint(
                condition=models.Q(host_type='owner', event__isnull=False, host_user__isnull=False),
                fields=('event', 'host_user'),
                name='unique_attendance_owner_per_event'
            ),
        ),
        migrations.AddConstraint(
            model_name='attendedsession',
            constraint=models.UniqueConstraint(
                condition=models.Q(host_type='team_member', event__isnull=False, host_team_member__isnull=False),
                fields=('event', 'host_team_member'),
                name='unique_attendance_member_per_event'
            ),
        ),
    ]
