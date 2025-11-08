import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const API_URL = 'http://127.0.0.1:8000/api/reports'

function App() {
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isPreloading, setIsPreloading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Preloader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Reverse geocoding function
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data.address) {
        const { road, suburb, city, municipality, province, country } = data.address
        const addressParts = [
          road,
          suburb || municipality,
          city || province,
          country
        ].filter(Boolean)
        
        return addressParts.join(', ')
      }
      return 'Address not found'
    } catch (error) {
      console.error('Geocoding error:', error)
      return 'Unable to fetch address'
    }
  }

  // Get user's location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          setLocation(coords)
          
          // Get address from coordinates
          const locationAddress = await getAddressFromCoords(
            coords.latitude,
            coords.longitude
          )
          setAddress(locationAddress)
        },
        (error) => {
          setError('Location access denied. Please enable location services.')
          console.error('Location error:', error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setError('Geolocation is not supported by your device.')
    }
  }, [])

  const sendEmergencyReport = async () => {
    if (!location) {
      setError('Location not available. Please enable location services.')
      return
    }

    if (!message.trim()) {
      setError('Please describe what help you need.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const deviceId = localStorage.getItem('device_id') || 
                       `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', deviceId)

      await axios.post(`${API_URL}/send/`, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        message: message.trim(),
        device_id: deviceId
      })

      setSuccess(true)
      setMessage('')
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send report. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Preloader component
  if (isPreloading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]' 
          : 'bg-gradient-to-b from-white via-blue-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="relative mb-8 flex justify-center">
            <div className="relative">
              {/* Image Container */}
              <div className={`w-32 h-32 rounded-full ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              } flex items-center justify-center shadow-2xl animate-pulse p-2`}>
                <img 
                  src="/Negros.webp" 
                  alt="Negros Island" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              {/* Ripple effect */}
              <div className={`absolute inset-0 w-32 h-32 rounded-full ${
                darkMode ? 'border-blue-500' : 'border-blue-400'
              } border-4 animate-ping opacity-20`}></div>
            </div>
          </div>

          <h1 className={`text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Tabang Negros
          </h1>
          <p className={`text-sm mb-8 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Emergency Help Request System
          </p>

          <div className="flex justify-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-bounce ${
              darkMode ? 'bg-blue-500' : 'bg-blue-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-3 h-3 rounded-full animate-bounce ${
              darkMode ? 'bg-blue-500' : 'bg-blue-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-3 h-3 rounded-full animate-bounce ${
              darkMode ? 'bg-blue-500' : 'bg-blue-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]' 
        : 'bg-gradient-to-b from-white via-blue-50 to-blue-100'
    }`}>
      {/* Header */}
      <header className={`${
        darkMode 
          ? 'bg-gradient-to-r from-blue-900 to-blue-800' 
          : 'bg-gradient-to-r from-blue-600 to-blue-500'
      } text-white py-6 px-4 shadow-lg transition-colors duration-300`}>
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Tabang Negros</h1>
              <p className="text-sm mt-1 opacity-90">Emergency Help Request</p>
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {/* Location Status & Map */}
        <div className={`${
          darkMode 
            ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
            : 'bg-white border border-blue-100'
        } rounded-xl shadow-lg p-4 mb-4 transition-colors duration-300 overflow-hidden`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${
              location ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className={`text-sm font-medium ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              {location ? 'Location Active' : 'Getting location...'}
            </span>
          </div>
          
          {location && (
            <>
              <p className={`text-xs mb-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                📍 {address || 'Loading address...'}
              </p>
              <p className={`text-xs mb-3 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Accuracy: ±{Math.round(location.accuracy)}m
              </p>
              
              {/* Map */}
              <div className="h-48 rounded-lg overflow-hidden">
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[location.latitude, location.longitude]}>
                    <Popup>Your location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className={`${
            darkMode
              ? 'bg-gradient-to-r from-green-600 to-emerald-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          } text-white rounded-xl p-4 mb-4 shadow-lg animate-pulse`}>
            <p className="font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Help request sent!
            </p>
            <p className="text-sm mt-1 opacity-90">Emergency responders have been notified.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`${
            darkMode 
              ? 'bg-red-900/50 border-red-700' 
              : 'bg-red-50 border-red-300'
          } border rounded-xl p-4 mb-4 transition-colors duration-300`}>
            <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
          </div>
        )}

        {/* Message Input */}
        <div className={`${
          darkMode 
            ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
            : 'bg-white border border-blue-100'
        } rounded-xl shadow-lg p-4 mb-4 transition-colors duration-300`}>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>
            What help do you need?
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Trapped on 2nd floor, water rising, need rescue..."
            className={`w-full p-3 rounded-lg resize-none transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-900/50 border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-white border-blue-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500'
            } border focus:ring-2 focus:outline-none`}
            rows="4"
            maxLength="500"
            disabled={loading}
          />
          <p className={`text-xs mt-2 text-right ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {message.length}/500
          </p>
        </div>

        {/* Emergency Button */}
        <button
          onClick={sendEmergencyReport}
          disabled={loading || !location}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
            loading || !location
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : darkMode
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white active:scale-95 shadow-blue-500/50'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white active:scale-95 shadow-blue-300/50'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🚨 SEND HELP REQUEST
            </span>
          )}
        </button>

        {/* Info */}
        <div className={`mt-auto pt-6 text-center text-xs ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        } transition-colors duration-300`}>
          <p>Your location will be shared with emergency responders.</p>
          <p className="mt-1">For life-threatening emergencies, call 911 immediately.</p>
        </div>
      </main>
    </div>
  )
}

export default App