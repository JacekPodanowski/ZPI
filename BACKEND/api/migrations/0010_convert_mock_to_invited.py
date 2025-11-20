# Generated migration to convert 'mock' status to 'invited'

from django.db import migrations


def convert_mock_to_invited(apps, schema_editor):
    """Convert all TeamMember records with 'mock' status to 'invited'."""
    TeamMember = apps.get_model('api', 'TeamMember')
    TeamMember.objects.filter(invitation_status='mock').update(invitation_status='invited')


def reverse_convert(apps, schema_editor):
    """Reverse operation - convert 'invited' back to 'mock' (for rollback)."""
    # Note: This will convert ALL 'invited' to 'mock', which may not be desired
    # but is needed for migration reversibility
    pass  # We can't reliably reverse this operation


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_remove_mock_status'),
    ]

    operations = [
        migrations.RunPython(convert_mock_to_invited, reverse_convert),
    ]
