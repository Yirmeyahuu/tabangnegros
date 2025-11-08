import { useState, useRef } from 'react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export default function CameraCapture({ darkMode, onPhotosCapture }) {
  const [photos, setPhotos] = useState([null, null])
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState('')

  const capturePhoto = async (photoIndex) => {
    setCapturing(true)
    setError('')

    try {
      // Request camera permission
      const permission = await Camera.checkPermissions()
      
      if (permission.camera !== 'granted') {
        const request = await Camera.requestPermissions({ permissions: ['camera'] })
        if (request.camera === 'denied') {
          setError('Camera permission denied. Please enable camera access.')
          setCapturing(false)
          return
        }
      }

      // Take photo using camera only (no gallery)
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera, // Force camera only
        saveToGallery: false
      })

      // Validate file size (5MB max)
      const base64Data = photo.dataUrl
      const sizeInBytes = (base64Data.length * 3) / 4 - 2
      const sizeInMB = sizeInBytes / (1024 * 1024)

      if (sizeInMB > 5) {
        setError(`Photo ${photoIndex + 1} exceeds 5MB. Please try again.`)
        setCapturing(false)
        return
      }

      // Update photos array
      const newPhotos = [...photos]
      newPhotos[photoIndex] = photo.dataUrl
      setPhotos(newPhotos)

      // Notify parent component
      onPhotosCapture(newPhotos)

    } catch (err) {
      console.error('Camera error:', err)
      setError('Failed to capture photo. Please try again.')
    } finally {
      setCapturing(false)
    }
  }

  const removePhoto = (photoIndex) => {
    const newPhotos = [...photos]
    newPhotos[photoIndex] = null
    setPhotos(newPhotos)
    onPhotosCapture(newPhotos)
  }

  return (
    <div className={`${
      darkMode 
        ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700' 
        : 'bg-white border border-blue-100'
    } rounded-xl shadow-lg p-4 mb-4 transition-colors duration-300`}>
      
      <label className={`block text-sm font-medium mb-3 ${
        darkMode ? 'text-slate-200' : 'text-slate-700'
      }`}>
        📸 Take 2 Photos (Required)
      </label>

      {error && (
        <div className={`${
          darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-300'
        } border rounded-lg p-3 mb-3`}>
          <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((index) => (
          <div key={index}>
            {photos[index] ? (
              <div className="relative">
                <img 
                  src={photos[index]} 
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => capturePhoto(index)}
                disabled={capturing}
                className={`w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                  capturing
                    ? 'bg-gray-200 cursor-not-allowed'
                    : darkMode
                    ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/50'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <svg className={`w-8 h-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Photo {index + 1}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      <p className={`text-xs mt-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        • Max 5MB per photo • JPG, JPEG, PNG only
      </p>
    </div>
  )
}