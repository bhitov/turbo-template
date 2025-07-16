import { useState, useEffect } from 'react'
import { streamingApi } from '../utils/streaming'

export default function StreamingTime() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let isActive = true

    const startStream = async () => {
      try {
        setIsConnected(true)
        setError('')
        
        // Get the stream from the server - treat as any for now
        const result = await (streamingApi.time.get as any)()
        
        // Try to iterate if possible
        try {
          for await (const timeData of result) {
            if (!isActive) break // Stop if component unmounted
            
            if (timeData && timeData.formatted) {
              setCurrentTime(timeData.formatted)
            }
          }
        } catch (iterError) {
          // If not iterable, just display the result
          if (result && result.formatted) {
            setCurrentTime(result.formatted)
          } else {
            setCurrentTime('Connected but no stream data')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to stream')
        setIsConnected(false)
      }
    }

    startStream()

    // Cleanup function
    return () => {
      isActive = false
      setIsConnected(false)
    }
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Live Server Time</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}
        
        <div className="text-2xl font-mono">
          {currentTime || 'Waiting for time...'}
        </div>
      </div>
    </div>
  )
}
