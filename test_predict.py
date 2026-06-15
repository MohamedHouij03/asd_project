#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_name.settings')
django.setup()

from django.contrib.auth.models import User
from django.test import Client

# Create test user if doesn't exist
user, created = User.objects.get_or_create(username='testuser', defaults={'email': 'test@test.com'})
if created:
    user.set_password('testpass123')
    user.save()
    print(f"Created test user: testuser")
else:
    print(f"Test user already exists")

# Test the view
client = Client()
client.login(username='testuser', password='testpass123')
response = client.get('/predict/')

if response.status_code == 200:
    print("✓ Page loaded successfully (HTTP 200)")
    # Check if page contains expected elements
    content = response.content.decode()
    if 'Behavioral screening questionnaire' in content:
        print("✓ Page contains expected content")
    if 'predict.js' in content:
        print("✓ External JS file is linked")
    if 'css/predict.css' in content:
        print("✓ External CSS file is linked")
else:
    print(f"✗ Page returned HTTP {response.status_code}")
    print(response.content.decode()[:500])
