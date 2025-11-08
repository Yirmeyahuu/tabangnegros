# Tabang Negros - Backend API

Django REST API for emergency help request system for Negros Island.

## 🚀 Features

- Emergency report submission with geolocation
- REST API endpoints
- PostgreSQL database support
- CORS enabled for React frontend
- Admin panel for managing reports

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL (optional, uses SQLite by default)
- pip

## 🛠️ Installation

1. **Create virtual environment:**
```bash
python -m venv virt
source virt/bin/activate  # On Mac/Linux
# or
virt\Scripts\activate  # On Windows
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run migrations:**
```bash
python manage.py migrate
```

5. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

6. **Run development server:**
```bash
python manage.py runserver
```

Server runs at: `http://127.0.0.1:8000`

## 📁 Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env
├── tabangnegrosproj/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── reports/
    ├── models.py
    ├── views.py
    ├── serializers.py
    └── urls.py
```

## 🔌 API Endpoints

### Send Emergency Report
```http
POST /api/reports/send/
Content-Type: application/json

{
  "latitude": 10.6763,
  "longitude": 122.9575,
  "accuracy": 10.5,
  "message": "Need help - flooding",
  "device_id": "device-123"
}
```

### Get All Reports (Admin)
```http
GET /api/reports/
```

## 🔐 Environment Variables

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional)
DB_NAME=tabangnegros
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

## 🧪 Testing

```bash
python manage.py test
```

## 📦 Dependencies

- Django 5.2.8
- djangorestframework 3.16.1
- django-cors-headers 4.9.0
- python-dotenv 1.2.1
- psycopg2-binary 2.9.11 (for PostgreSQL)

## 🚀 Deployment

For production deployment, remember to:

1. Set `DEBUG=False`
2. Update `ALLOWED_HOSTS`
3. Use PostgreSQL instead of SQLite
4. Set up proper SECRET_KEY
5. Configure static files
6. Use gunicorn/uwsgi

## 👨‍💻 Admin Panel

Access admin panel at: `http://127.0.0.1:8000/admin`

## 📝 License

MIT License