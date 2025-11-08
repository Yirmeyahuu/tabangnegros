#!/usr/bin/env bash
set -o errexit

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Running migrations ==="
python manage.py migrate --run-syncdb || {
    echo "Migration failed — attempting fake-initial"
    python manage.py migrate --fake-initial
    python manage.py migrate
}

echo "=== Creating superuser if needed ==="
python manage.py shell <<'EOF'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.getenv('DJANGO_SUPERUSER_USERNAME')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'✅ Superuser {username} created successfully!')
    else:
        print(f'ℹ️  Superuser {username} already exists')
else:
    print('⚠️  DJANGO_SUPERUSER credentials not set')
EOF

echo "=== Verifying staticfiles ==="
ls -la staticfiles/index.html || echo "⚠️  No index.html found!"

echo "=== Build completed ==="