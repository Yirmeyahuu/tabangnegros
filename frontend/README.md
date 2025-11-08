# Tabang Negros - Frontend

Modern React + Vite emergency help request web application for Negros Island.

## 🚀 Features

- 📱 Mobile-first responsive design
- 🌓 Dark/Light mode with blue theme
- 📍 Real-time geolocation tracking
- 🗺️ Interactive map with Leaflet
- 🎨 Modern UI with Tailwind CSS v4
- ⚡ Fast development with Vite
- 🔄 Reverse geocoding for address display

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

App runs at: `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   └── assets/
└── public/
```

## 🎨 Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet + React-Leaflet
- **HTTP Client:** Axios
- **Routing:** React Router (optional)

## 🔌 API Configuration

Update API URL in `src/App.jsx`:

```javascript
const API_URL = 'http://127.0.0.1:8000/api/reports'
```

For production:
```javascript
const API_URL = 'https://your-backend-url.com/api/reports'
```

## 🎨 Theme Colors

**Light Mode:**
- Background: White with blue gradient
- Primary: Blue (#3B82F6)
- Accent: Blue (#2563EB)

**Dark Mode:**
- Background: Dark blue gradient (#0f172a → #334155)
- Primary: Blue (#3B82F6)
- Accent: Blue (#60A5FA)

## 📱 Testing on Mobile

1. **Get your computer's IP:**
```bash
ifconfig | grep inet  # Mac/Linux
ipconfig              # Windows
```

2. **Update Vite config** (already configured):
```javascript
server: {
  host: true,
  port: 5173,
}
```

3. **Access from phone:**
```
http://YOUR_IP:5173
```

Make sure both devices are on the same WiFi network.

## 🏗️ Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🧪 Linting

```bash
npm run lint
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^19.1.16",
    "react-dom": "^19.1.9",
    "axios": "^1.7.9",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.36.0"
  }
}
```

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder
```

## 🔧 Environment Variables

Create `.env` file (optional):
```env
VITE_API_URL=http://127.0.0.1:8000/api/reports
```

Use in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

## 📝 Features Checklist

- ✅ Preloader animation
- ✅ Dark/Light mode toggle
- ✅ Geolocation tracking
- ✅ Interactive map
- ✅ Reverse geocoding
- ✅ Emergency message input
- ✅ Success/Error notifications
- ✅ Mobile-responsive design
- ✅ Smooth transitions

## 👨‍💻 Development Tips

1. **Hot Module Replacement (HMR)** works automatically
2. **Dark mode preference** persists in localStorage
3. **Location permission** required for full functionality
4. **Map tiles** from OpenStreetMap (free)

## 📝 License

MIT License