"""
core/management/commands/seed_content.py
─────────────────────────────────────────
Populates the database with initial FAQ entries and article categories.
Run once after migrations:
  python manage.py seed_content
"""
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed initial FAQ and article category content'

    def handle(self, *args, **options):
        from core.models import FAQ, ArticleCategory, Article
        from django.contrib.auth.models import User

        self.stdout.write('Seeding FAQ entries…')
        faqs = [
            ('general',    0,  'What is Mindello?',
             'Mindello is an AI-powered ASD screening platform that helps parents and clinicians identify early autism spectrum disorder indicators using machine learning. It uses a Random Forest model with SHAP explainability.'),
            ('general',    1,  'Is Mindello free to use?',
             'Yes. Creating an account and running ASD screenings is completely free. We believe early screening tools should be accessible to every family.'),
            ('general',    2,  'Who is Mindello for?',
             'Mindello is designed for parents and guardians who have developmental concerns about their child, and for medical professionals who want a quick decision-support screening tool. Accounts support two roles: Parent/Guardian and Medical Professional.'),
            ('assessment', 0,  'How long does a screening take?',
             'Most users complete a screening in 5–10 minutes. The 4-step form covers demographics, medical history, the AQ-10 questionnaire, and clinical observations.'),
            ('assessment', 1,  'What is the AQ-10?',
             'The AQ-10 (Autism Spectrum Quotient – 10 items) is a validated screening tool used widely by clinicians to identify potential ASD indicators. Each question is answered as "Often/Always" or "Rarely/Never".'),
            ('assessment', 2,  'What is CARS?',
             'The Childhood Autism Rating Scale (CARS) is a 15-to-60 point clinical rating tool. A score below 30 suggests minimal ASD symptoms; 30–36 indicates mild to moderate; above 36 indicates moderate to severe. Enter 15 if unsure.'),
            ('results',    0,  'What does a positive result mean?',
             'A positive result ("indicators found") means the data pattern is consistent with ASD. It is NOT a diagnosis. Always consult a qualified healthcare professional — a paediatrician, developmental psychologist, or speech therapist.'),
            ('results',    1,  'What is SHAP explainability?',
             'SHAP (SHapley Additive exPlanations) is a technique from explainable AI that shows which factors influenced the prediction the most. It makes our results transparent — you can see why the model reached its conclusion.'),
            ('results',    2,  'How accurate is the model?',
             'The Random Forest model achieved 97% accuracy on our validation dataset. However, no screening tool is perfect, and real-world accuracy depends on the quality and accuracy of inputs provided.'),
            ('privacy',    0,  'Who can see my screening data?',
             'Only you can see your data. We use JWT authentication and encrypted sessions. Your screening history is accessible only to your account. We never sell or share personal data with third parties.'),
            ('privacy',    1,  'Can I delete my data?',
             'Yes. You can delete individual screenings from the History page. To request full account and data deletion, contact us at hello@mindello.ai.'),
            ('account',    0,  'How do I change my password?',
             'Go to Settings → Security → Change Password. Enter your current password and choose a new one with at least 8 characters.'),
            ('account',    1,  'What roles are available?',
             'Mindello supports two roles: Parent/Guardian (for family-led screenings) and Medical Professional (for clinical use). You can choose when registering.'),
        ]
        created = 0
        for cat, order, q, a in faqs:
            obj, is_new = FAQ.objects.get_or_create(
                question=q,
                defaults={'answer': a, 'category': cat, 'order': order, 'is_active': True},
            )
            if is_new:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'  Created {created} FAQ entries.'))

        self.stdout.write('Seeding article categories…')
        cats = [
            ('What is Autism?',     'what-is-autism',  '🧠', 'Understanding ASD', 0),
            ('Signs & Symptoms',    'signs-symptoms',  '🔍', 'Early identification', 1),
            ('Diagnosis',           'diagnosis',       '📋', 'The diagnosis process', 2),
            ('Intervention',        'intervention',    '🌱', 'Early intervention strategies', 3),
            ('Family Support',      'family-support',  '❤️', 'Resources for families', 4),
            ('Research & Science',  'research',        '🔬', 'Latest ASD research', 5),
        ]
        cat_created = 0
        for name, slug, icon, desc, order in cats:
            obj, is_new = ArticleCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'icon': icon, 'description': desc, 'order': order},
            )
            if is_new:
                cat_created += 1
        self.stdout.write(self.style.SUCCESS(f'  Created {cat_created} article categories.'))

        self.stdout.write(self.style.SUCCESS('\n✅ Seed complete! Run `python manage.py createsuperuser` to create an admin account.'))
