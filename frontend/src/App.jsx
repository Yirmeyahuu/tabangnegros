import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { savePendingReport, getPendingReports, deletePendingReport } from './db'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import { Geolocation } from '@capacitor/geolocation'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const API_URL = 'https://tabangnegros.onrender.com/api/reports'

function UserApp() {
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
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [requestingLocation, setRequestingLocation] = useState(false)

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

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync pending reports when online
  useEffect(() => {
    const syncPendingReports = async () => {
      if (!isOnline) return
      
      try {
        const pending = await getPendingReports()
        setPendingCount(pending.length)
        
        for (const report of pending) {
          try {
            await axios.post(`${API_URL}/send/`, {
              latitude: report.latitude,
              longitude: report.longitude,
              accuracy: report.accuracy,
              message: report.message,
              device_id: report.device_id
            })
            await deletePendingReport(report.id)
            setPendingCount(prev => prev - 1)
          } catch (err) {
            console.error('Failed to sync report:', err)
          }
        }
      } catch (err) {
        console.error('Sync error:', err)
      }
    }
    
    syncPendingReports()
  }, [isOnline])

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

  // Enhanced location function with multiple fallbacks
  const requestLocationPermission = async () => {
    setRequestingLocation(true)
    setError('')

    try {
      console.log('Attempting to get location...')

      // Method 1: Try Capacitor Geolocation (works on most devices)
      try {
        const permission = await Geolocation.checkPermissions()
        console.log('Capacitor permission status:', permission.location)

        if (permission.location !== 'granted') {
          const requestResult = await Geolocation.requestPermissions()
          console.log('Permission request result:', requestResult.location)
          
          if (requestResult.location === 'denied') {
            throw new Error('Permission denied')
          }
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        })

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }

        console.log('✅ Location obtained via Capacitor:', coords)
        await handleLocationSuccess(coords)
        return

      } catch (capacitorError) {
        console.log('Capacitor failed:', capacitorError.message)
        
        // Method 2: Fallback to Browser Geolocation API (works without Play Services)
        if ('geolocation' in navigator) {
          console.log('Trying browser geolocation API...')
          
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const coords = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy
                }
                
                console.log('✅ Location obtained via Browser API:', coords)
                await handleLocationSuccess(coords)
                resolve()
              },
              (error) => {
                console.log('Browser geolocation failed:', error.message)
                reject(error)
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
              }
            )
          })
          return
        }
        
        throw new Error('All location methods failed')
      }

    } catch (error) {
      console.error('Final location error:', error)
      setRequestingLocation(false)
      setLocationPermission('denied')
      
      if (error.message.includes('denied') || error.code === 1) {
        setError('Location permission denied. Please enable location access in your device settings.')
      } else if (error.message.includes('unavailable') || error.code === 2) {
        setError('Location unavailable. Please check your GPS settings and try again.')
      } else if (error.message.includes('timeout') || error.code === 3) {
        setError('Location request timed out. Please ensure GPS is enabled and try again.')
      } else {
        setError('Unable to get location. Please ensure location services are enabled.')
      }
    }
  }

  // Helper function to handle successful location
  const handleLocationSuccess = async (coords) => {
    setLocation(coords)
    setLocationPermission('granted')
    
    const locationAddress = await getAddressFromCoords(
      coords.latitude,
      coords.longitude
    )
    setAddress(locationAddress)
    setRequestingLocation(false)
  }

  // Check initial location permission status
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        // Try Capacitor first
        try {
          const permission = await Geolocation.checkPermissions()
          setLocationPermission(permission.location)
          
          if (permission.location === 'granted') {
            requestLocationPermission()
          }
        } catch (err) {
          // If Capacitor fails, just wait for user to click button
          console.log('Capacitor check failed, waiting for user action')
        }
      } catch (error) {
        console.error('Error checking permissions:', error)
      }
    }
    
    checkInitialPermission()
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

    const deviceId = localStorage.getItem('device_id') || 
                     `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('device_id', deviceId)

    const reportData = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      message: message.trim(),
      device_id: deviceId
    }

    try {
      if (!isOnline) {
        await savePendingReport(reportData)
        setSuccess(true)
        setMessage('')
        setPendingCount(prev => prev + 1)
        setTimeout(() => setSuccess(false), 5000)
      } else {
        await axios.post(`${API_URL}/send/`, reportData)
        setSuccess(true)
        setMessage('')
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err) {
      if (isOnline) {
        try {
          await savePendingReport(reportData)
          setSuccess(true)
          setMessage('')
          setPendingCount(prev => prev + 1)
          setTimeout(() => setSuccess(false), 5000)
        } catch (offlineErr) {
          setError('Failed to save report. Please try again.')
        }
      } else {
        setError('Failed to send report. Please try again.')
      }
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Preloader (same as before)
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

      {!isOnline && (
        <div className="bg-yellow-500 text-white text-xs py-2 px-4 text-center font-medium">
          📡 Offline Mode - Reports will sync when online
          {pendingCount > 0 && ` (${pendingCount} pending)`}
        </div>
      )}

      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {!location && locationPermission !== 'granted' && (
          <div className={`${
            darkMode 
              ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
              : 'bg-white border border-blue-100'
          } rounded-xl shadow-lg p-6 mb-4 transition-colors duration-300`}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              } flex items-center justify-center`}>
                <svg className={`w-8 h-8 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              <h3 className={`text-lg font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                Enable Location Access
              </h3>
              
              <p className={`text-sm mb-4 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                We need your precise location to send help to the right place during emergencies.
              </p>

              <button
                onClick={requestLocationPermission}
                disabled={requestingLocation}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  requestingLocation
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : darkMode
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                }`}
              >
                {requestingLocation ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting Location...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Allow Location Access
                  </span>
                )}
              </button>

              <p className={`text-xs mt-3 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                🔒 Your location is only shared when you send a help request
              </p>
              
              <p className={`text-xs mt-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                ✅ Works on all devices (Huawei, Samsung, etc.)
              </p>
            </div>
          </div>
        )}

        {location && (
          <div className={`${
            darkMode 
              ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
              : 'bg-white border border-blue-100'
          } rounded-xl shadow-lg p-4 mb-4 transition-colors duration-300 overflow-hidden`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  location ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Location Active
                </span>
              </div>
              
              <button
                onClick={requestLocationPermission}
                disabled={requestingLocation}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  darkMode
                    ? 'bg-blue-900/50 hover:bg-blue-900 text-blue-300'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
                title="Refresh location"
              >
                {requestingLocation ? '↻' : '🔄 Refresh'}
              </button>
            </div>
            
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
          </div>
        )}

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
              {isOnline ? 'Help request sent!' : 'Help request saved offline!'}
            </p>
            <p className="text-sm mt-1 opacity-90">
              {isOnline 
                ? 'Emergency responders have been notified.' 
                : 'Will be sent when connection is restored.'}
            </p>
          </div>
        )}

        {error && (
          <div className={`${
            darkMode 
              ? 'bg-red-900/50 border-red-700' 
              : 'bg-red-50 border-red-300'
          } border rounded-xl p-4 mb-4 transition-colors duration-300`}>
            <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
          </div>
        )}

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
              {isOnline ? 'Sending...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🚨 SEND HELP REQUEST
            </span>
          )}
        </button>

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserApp />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App