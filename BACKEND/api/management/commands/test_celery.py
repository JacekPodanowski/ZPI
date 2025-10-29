"""
Management command to test Celery tasks.
"""
from django.core.management.base import BaseCommand
from api.tasks import process_image_async, cleanup_unused_media


class Command(BaseCommand):
    help = 'Test Celery tasks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--task',
            type=str,
            default='debug',
            help='Task to run: debug, cleanup'
        )

    def handle(self, *args, **options):
        task_name = options['task']
        
        if task_name == 'cleanup':
            self.stdout.write('Scheduling cleanup task...')
            result = cleanup_unused_media.delay(older_than_hours=24)
            self.stdout.write(self.style.SUCCESS(f'Task scheduled: {result.id}'))
            
        elif task_name == 'debug':
            from site_project.celery import debug_task
            self.stdout.write('Scheduling debug task...')
            result = debug_task.delay()
            self.stdout.write(self.style.SUCCESS(f'Task scheduled: {result.id}'))
            
        else:
            self.stdout.write(self.style.ERROR(f'Unknown task: {task_name}'))
