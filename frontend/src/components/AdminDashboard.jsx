import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const API_URL = 'https://tabangnegros.onrender.com/api/reports'

// Custom icon for emergency markers
const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function AdminDashboard() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/active/`)
      setReports(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    
    if (autoRefresh) {
      const interval = setInterval(fetchReports, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const updateStatus = async (reportId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/${reportId}/status/`, {
        status: newStatus
      })
      fetchReports() // Refresh list
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-red-500',
      acknowledged: 'bg-yellow-500',
      responding: 'bg-blue-500',
      resolved: 'bg-green-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000) // seconds
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Emergency Response Dashboard</h1>
            <p className="text-sm text-slate-400">
              {reports.length} active {reports.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map View */}
        <div className="bg-slate-800 rounded-xl p-4 h-[600px]">
          <h2 className="text-xl font-bold mb-4">Live Map</h2>
          <div className="h-[calc(100%-3rem)] rounded-lg overflow-hidden">
            <MapContainer
              center={[10.3157, 123.8854]} // Negros Island center
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reports.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.latitude, report.longitude]}
                  icon={emergencyIcon}
                >
                  <Popup>
                    <div className="text-slate-900">
                      <p className="font-bold">Emergency #{report.id}</p>
                      <p className="text-sm">{report.message}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {getTimeAgo(report.created_at)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-slate-800 rounded-xl p-4 h-[600px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Active Requests</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-700 rounded-lg p-4 border-l-4"
                style={{ borderColor: getStatusColor(report.status).replace('bg-', '') }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">Emergency #{report.id}</h3>
                    <p className="text-xs text-slate-400">{getTimeAgo(report.created_at)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                
                <p className="text-sm mb-3">{report.message}</p>
                
                <div className="text-xs text-slate-400 mb-3">
                  <p>📍 {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</p>
                  <p>🎯 Accuracy: ±{Math.round(report.accuracy)}m</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {report.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(report.id, 'acknowledged')}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                    >
                      Acknowledge
                    </button>
                  )}
                  {report.status === 'acknowledged' && (
                    <button
                      onClick={() => updateStatus(report.id, 'responding')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Responding
                    </button>
                  )}
                  {(report.status === 'responding' || report.status === 'acknowledged') && (
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                    >
                      Resolve
                    </button>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                  >
                    📍 Navigate
                  </a>
                </div>
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No active emergency requests
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard