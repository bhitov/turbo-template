import { implement } from '@orpc/server'
import { streamingContract } from '@repo/api-contract'

// ==========================================
// Implement Streaming Contract (Server Side)
// ==========================================

// Create the implementer from our streaming contract
const os = implement(streamingContract)

// Implement the streamTime procedure
export const streamTime = os.time.get

  .handler(async function* () {
    // Stream datetime every second
    while (true) {
      const now = new Date()
      yield {
        timestamp: now.toISOString(),
        formatted: now.toLocaleString()
      }
      
      // Wait 1 second before sending next update
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  })

// ==========================================
// Build Router from Streaming Contract Implementation
// ==========================================

export const streamingRouter = os.router({
  time: {
    get: streamTime,
  },
})
