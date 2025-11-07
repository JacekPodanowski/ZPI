# Data migration to create default email templates
from django.db import migrations


def create_default_templates(apps, schema_editor):
    EmailTemplate = apps.get_model('api', 'EmailTemplate')
    
    templates = [
        {
            'name': 'Potwierdzenie rezerwacji',
            'slug': 'booking-confirmation-default',
            'category': 'booking_confirmation',
            'subject_pl': 'Potwierdzenie rezerwacji - {{event_title}}',
            'subject_en': 'Booking Confirmation - {{event_title}}',
            'content_pl': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; padding: 14px 32px; background-color: rgb(146, 0, 32); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>✓ Rezerwacja potwierdzona</h1></div>
        <div class="content">
            <p>Cześć <strong>{{client_name}}</strong>,</p>
            <p>Dziękujemy za rezerwację! Twoje spotkanie zostało potwierdzone.</p>
            <div class="details">
                <div><strong>Tytuł:</strong> {{event_title}}</div>
                <div><strong>Data:</strong> {{event_date}}</div>
                <div><strong>Godzina:</strong> {{event_time}}</div>
            </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{cancellation_link}}" class="button">Odwołaj rezerwację</a>
        </div>
        <div class="footer"><p>Link do odwołania wygasa za {{cancellation_deadline}}.</p></div>
    </div>
</body>
</html>''',
            'content_en': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; padding: 14px 32px; background-color: rgb(146, 0, 32); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>✓ Booking Confirmed</h1></div>
        <div class="content">
            <p>Hi <strong>{{client_name}}</strong>,</p>
            <p>Thank you for your booking! Your appointment has been confirmed.</p>
            <div class="details">
                <div><strong>Title:</strong> {{event_title}}</div>
                <div><strong>Date:</strong> {{event_date}}</div>
                <div><strong>Time:</strong> {{event_time}}</div>
            </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{cancellation_link}}" class="button">Cancel Booking</a>
        </div>
        <div class="footer"><p>Cancellation link expires in {{cancellation_deadline}}.</p></div>
    </div>
</body>
</html>''',
            'is_default': True,
        },
        {
            'name': 'Odwołanie rezerwacji',
            'slug': 'booking-cancellation-default',
            'category': 'booking_cancellation',
            'subject_pl': 'Rezerwacja odwołana - {{event_title}}',
            'subject_en': 'Booking Cancelled - {{event_title}}',
            'content_pl': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Rezerwacja odwołana</h1></div>
        <div class="content">
            <p>Cześć <strong>{{client_name}}</strong>,</p>
            <p>Twoja rezerwacja została odwołana.</p>
            <div class="details">
                <div><strong>Tytuł:</strong> {{event_title}}</div>
                <div><strong>Data:</strong> {{event_date}}</div>
                <div><strong>Godzina:</strong> {{event_time}}</div>
            </div>
            <p>Jeśli chcesz zarezerwować nowy termin, odwiedź naszą stronę.</p>
        </div>
    </div>
</body>
</html>''',
            'content_en': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Booking Cancelled</h1></div>
        <div class="content">
            <p>Hi <strong>{{client_name}}</strong>,</p>
            <p>Your booking has been cancelled.</p>
            <div class="details">
                <div><strong>Title:</strong> {{event_title}}</div>
                <div><strong>Date:</strong> {{event_date}}</div>
                <div><strong>Time:</strong> {{event_time}}</div>
            </div>
            <p>If you'd like to book a new appointment, please visit our website.</p>
        </div>
    </div>
</body>
</html>''',
            'is_default': True,
        },
        {
            'name': 'Rejestracja konta',
            'slug': 'account-registration-default',
            'category': 'account_registration',
            'subject_pl': 'Witaj w {{site_name}}! Potwierdź swoje konto',
            'subject_en': 'Welcome to {{site_name}}! Confirm your account',
            'content_pl': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .button { display: inline-block; padding: 14px 32px; background-color: rgb(146, 0, 32); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Witamy w {{site_name}}!</h1></div>
        <div class="content">
            <p>Cześć <strong>{{user_name}}</strong>,</p>
            <p>Dziękujemy za rejestrację! Aby dokończyć proces, kliknij poniższy przycisk i potwierdź swoje konto.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmation_link}}" class="button">Potwierdź konto</a>
        </div>
        <div style="margin-top: 30px; font-size: 14px; color: #666;">
            <p>Link wygasa za {{expiration_time}}.</p>
        </div>
    </div>
</body>
</html>''',
            'content_en': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .button { display: inline-block; padding: 14px 32px; background-color: rgb(146, 0, 32); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Welcome to {{site_name}}!</h1></div>
        <div class="content">
            <p>Hi <strong>{{user_name}}</strong>,</p>
            <p>Thank you for signing up! To complete the process, please click the button below to confirm your account.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmation_link}}" class="button">Confirm Account</a>
        </div>
        <div style="margin-top: 30px; font-size: 14px; color: #666;">
            <p>Link expires in {{expiration_time}}.</p>
        </div>
    </div>
</body>
</html>''',
            'is_default': True,
        },
        {
            'name': 'Status strony',
            'slug': 'site-status-default',
            'category': 'site_status',
            'subject_pl': 'Status Twojej strony: {{status}}',
            'subject_en': 'Your Site Status: {{status}}',
            'content_pl': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .status-box { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Zmiana statusu strony</h1></div>
        <div class="content">
            <p>Cześć <strong>{{owner_name}}</strong>,</p>
            <p>Status Twojej strony <strong>{{site_name}}</strong> został zaktualizowany.</p>
            <div class="status-box">
                <h2 style="margin: 0; color: rgb(146, 0, 32);">{{status}}</h2>
            </div>
            <p>{{status_message}}</p>
        </div>
    </div>
</body>
</html>''',
            'content_en': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .status-box { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Site Status Update</h1></div>
        <div class="content">
            <p>Hi <strong>{{owner_name}}</strong>,</p>
            <p>The status of your site <strong>{{site_name}}</strong> has been updated.</p>
            <div class="status-box">
                <h2 style="margin: 0; color: rgb(146, 0, 32);">{{status}}</h2>
            </div>
            <p>{{status_message}}</p>
        </div>
    </div>
</body>
</html>''',
            'is_default': True,
        },
        {
            'name': 'Zmiana planu',
            'slug': 'plan-change-default',
            'category': 'plan_change',
            'subject_pl': 'Potwierdzenie zmiany planu na {{plan_name}}',
            'subject_en': 'Plan Change Confirmation: {{plan_name}}',
            'content_pl': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .plan-box { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Zmiana planu potwierdzona</h1></div>
        <div class="content">
            <p>Cześć <strong>{{user_name}}</strong>,</p>
            <p>Twój plan został zmieniony na:</p>
            <div class="plan-box">
                <h2 style="margin: 0; color: rgb(146, 0, 32);">{{plan_name}}</h2>
                <p style="margin: 10px 0 0 0;">{{plan_price}} / miesiąc</p>
            </div>
            <p>Zmiana wejdzie w życie z dniem {{effective_date}}.</p>
        </div>
    </div>
</body>
</html>''',
            'content_en': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .plan-box { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Plan Change Confirmed</h1></div>
        <div class="content">
            <p>Hi <strong>{{user_name}}</strong>,</p>
            <p>Your plan has been changed to:</p>
            <div class="plan-box">
                <h2 style="margin: 0; color: rgb(146, 0, 32);">{{plan_name}}</h2>
                <p style="margin: 10px 0 0 0;">{{plan_price}} / month</p>
            </div>
            <p>The change will take effect on {{effective_date}}.</p>
        </div>
    </div>
</body>
</html>''',
            'is_default': True,
        },
        {
            'name': 'Przypomnienie o subskrypcji',
            'slug': 'subscription-reminder-default',
            'category': 'subscription_reminder',
            'subject_pl': 'Twoja subskrypcja wygasa za {{days_remaining}} dni',
            'subject_en': 'Your subscription expires in {{days_remaining}} days',
            'content_pl': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .warning-box { background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid rgb(146, 0, 32); }
        .button { display: inline-block; padding: 14px 32px; background-color: rgb(146, 0, 32); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>⏰ Przypomnienie o subskrypcji</h1></div>
        <div class="content">
            <p>Cześć <strong>{{user_name}}</strong>,</p>
            <div class="warning-box">
                <p style="margin: 0;"><strong>Twoja subskrypcja wygasa za {{days_remaining}} dni</strong></p>
                <p style="margin: 10px 0 0 0;">Data wygaśnięcia: {{expiration_date}}</p>
            </div>
            <p>Aby zapewnić ciągłość działania Twojej strony, zaktualizuj metodę płatności lub odnów subskrypcję.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{payment_link}}" class="button">Zarządzaj subskrypcją</a>
        </div>
    </div>
</body>
</html>''',
            'content_en': '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: rgb(146, 0, 32); margin: 0; font-size: 24px; }
        .warning-box { background-color: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid rgb(146, 0, 32); }
        .button { display: inline-block; padding: 14px 32px; background-color: rgb(146, 0, 32); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>⏰ Subscription Reminder</h1></div>
        <div class="content">
            <p>Hi <strong>{{user_name}}</strong>,</p>
            <div class="warning-box">
                <p style="margin: 0;"><strong>Your subscription expires in {{days_remaining}} days</strong></p>
                <p style="margin: 10px 0 0 0;">Expiration date: {{expiration_date}}</p>
            </div>
            <p>To ensure uninterrupted service, please update your payment method or renew your subscription.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{payment_link}}" class="button">Manage Subscription</a>
        </div>
    </div>
</body>
</html>''',
            'is_default': True,
        },
    ]
    
    for template_data in templates:
        EmailTemplate.objects.create(**template_data)


def reverse_default_templates(apps, schema_editor):
    EmailTemplate = apps.get_model('api', 'EmailTemplate')
    EmailTemplate.objects.filter(is_default=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_add_email_template_model'),
    ]

    operations = [
        migrations.RunPython(create_default_templates, reverse_default_templates),
    ]
