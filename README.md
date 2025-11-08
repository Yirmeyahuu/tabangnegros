# 🚨 Tabang Negros - Emergency Help Request System

A modern, real-time emergency help request system designed for Negros Island, Philippines. This full-stack web application allows users to quickly send emergency requests with their exact location to responders.

## 🌟 Overview

**Tabang Negros** (Hiligaynon for "Help Negros") is a mobile-first emergency response platform that enables citizens to:
- Request emergency assistance with one tap
- Share real-time GPS location
- Display exact address via reverse geocoding
- Visualize location on interactive maps
- Send detailed emergency messages

Perfect for disaster response, medical emergencies, and community safety initiatives.

## ✨ Features

### Frontend (React)
- 📱 **Mobile-First Design** - Optimized for smartphones
- 🌓 **Dark/Light Mode** - Blue-themed UI with smooth transitions
- 📍 **Real-Time GPS** - High-accuracy location tracking
- 🗺️ **Interactive Maps** - Leaflet integration with OpenStreetMap
- 🏠 **Reverse Geocoding** - Shows street address automatically
- ⚡ **Fast Loading** - Vite build system with preloader
- 🎨 **Modern UI** - Tailwind CSS v4 with glassmorphism effects

### Backend (Django)
- 🔌 **RESTful API** - Clean API endpoints
- 📊 **Admin Dashboard** - Manage emergency reports
- 🔐 **CORS Enabled** - Secure cross-origin requests
- 💾 **PostgreSQL Ready** - Production-ready database
- 🚀 **Scalable Architecture** - Django REST Framework

## 📁 Project Structure

```
tabangnegros/
├── README.md                 # This file
├── backend/                  # Django API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── tabangnegrosproj/    # Django project
│   └── reports/             # Reports app
└── frontend/                # React app
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for backend)
- **PostgreSQL** (optional, uses SQLite by default)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/tabangnegros.git
cd tabangnegros
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv virt
source virt/bin/activate  # Mac/Linux
# or
virt\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### 3. Frontend Setup

**Open new terminal:**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000/api/reports/
- **Admin Panel:** http://127.0.0.1:8000/admin

## 📱 Mobile Testing

### On Same WiFi Network

1. **Get your computer's IP:**
```bash
# Mac/Linux
ifconfig | grep inet

# Windows
ipconfig
```

2. **Access from phone:**
```
http://YOUR_IP:5173
```

3. **Allow location permissions** when prompted

## 🔌 API Documentation

### Send Emergency Report

```http
POST /api/reports/send/
Content-Type: application/json

{
  "latitude": 10.6763,
  "longitude": 122.9575,
  "accuracy": 10.5,
  "message": "Need rescue - 2nd floor flooded",
  "device_id": "device-abc123"
}
```

**Response:**
```json
{
  "id": 1,
  "latitude": 10.6763,
  "longitude": 122.9575,
  "accuracy": 10.5,
  "message": "Need rescue - 2nd floor flooded",
  "device_id": "device-abc123",
  "status": "pending",
  "created_at": "2025-11-08T10:30:00Z"
}
```

### Get All Reports (Admin)

```http
GET /api/reports/
Authorization: Token your-auth-token
```

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1 | UI Framework |
| Vite | 7.1 | Build Tool |
| Tailwind CSS | 4.0 | Styling |
| Leaflet | 1.9 | Maps |
| Axios | 1.7 | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 5.2 | Web Framework |
| DRF | 3.16 | REST API |
| PostgreSQL | Latest | Database |
| CORS Headers | 4.9 | Cross-Origin |
| python-dotenv | 1.2 | Config |

## 🎨 Color Theme

### Light Mode
- Background: White → Blue Gradient
- Primary: `#3B82F6` (Blue 500)
- Accent: `#2563EB` (Blue 600)

### Dark Mode
- Background: `#0f172a` → `#334155` (Dark Blue Gradient)
- Primary: `#3B82F6` (Blue 500)
- Accent: `#60A5FA` (Blue 400)

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel
```

### Backend (Railway/Heroku)

1. Set environment variables
2. Update `ALLOWED_HOSTS`
3. Set `DEBUG=False`
4. Configure PostgreSQL
5. Deploy with:

```bash
git push heroku main
heroku run python manage.py migrate
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run lint
```

## 📊 Features Roadmap

- [x] Real-time geolocation
- [x] Interactive maps
- [x] Dark/Light mode
- [x] Reverse geocoding
- [x] Emergency message submission
- [ ] SMS notifications
- [ ] Email alerts
- [ ] Multiple languages (Hiligaynon, Cebuano, English)
- [ ] Report status tracking
- [ ] Responder dashboard
- [ ] WebSocket real-time updates
- [ ] PWA (Progressive Web App)
- [ ] Offline support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=tabangnegros
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://127.0.0.1:8000/api/reports
```

## 🐛 Troubleshooting

### Location Not Working
- Enable location permissions in browser
- Use HTTPS in production (required for geolocation)
- Check if geolocation API is supported

### CORS Errors
- Verify `django-cors-headers` is installed
- Check `ALLOWED_HOSTS` in backend settings
- Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`

### Map Not Loading
- Check internet connection (map tiles load from CDN)
- Verify Leaflet CSS is imported
- Check browser console for errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Jeremiah Pantaras** - Initial work

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for map library
- Tailwind CSS for styling
- Django & React communities

## 📧 Contact

For questions or support:
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## ⚠️ Disclaimer

This is an emergency assistance tool. For life-threatening emergencies, always call official emergency numbers (911 in Philippines) immediately.

---

**Made with ❤️ for Negros Island, Philippines**

🚨 Stay Safe | 🆘 Help is Coming | 🌊 Disaster Ready