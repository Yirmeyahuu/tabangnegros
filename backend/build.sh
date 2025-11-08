#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Checking migration state ==="

# Collect static files
echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

# Apply migrations with smart error handling
echo "=== Running migrations with error handling ==="
python manage.py migrate --run-syncdb || {
    echo "Migration failed — attempting to fake-initialize existing tables..."
    python manage.py migrate --fake-initial
    python manage.py migrate
}

# Create superuser if it doesn't exist
echo "=== Creating superuser if needed ==="
python manage.py shell << EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

if not User.objects.filter(username=username).exists():
    if password:
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Superuser {username} created successfully!')
    else:
        print('DJANGO_SUPERUSER_PASSWORD not set, skipping superuser creation')
else:
    print(f'Superuser {username} already exists')
EOF

echo "=== Build completed successfully! ==="