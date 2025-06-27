'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

// Force Edge Runtime - this might have different crypto behavior
export const runtime = 'edge'

export default function EdgePage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [distinctId, setDistinctId] = useState<string>('')
  const [cryptoInfo, setCryptoInfo] = useState<string>('')
  const posthog = usePostHog()

  useEffect(() => {
    // Check crypto availability in Edge Runtime
    const cryptoCheck = {
      windowCrypto: typeof window !== 'undefined' ? typeof window.crypto : 'undefined',
      globalCrypto: typeof crypto,
      webCryptoAvailable: typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues ? 'yes' : 'no'
    }
    setCryptoInfo(JSON.stringify(cryptoCheck, null, 2))

    // Try to initialize PostHog in Edge Runtime context
    if (posthog) {
      try {
        const session = posthog?.get_session_id()
        const distinct = posthog?.get_distinct_id()
        
        setSessionId(session || 'failed-to-generate')
        setDistinctId(distinct || 'failed-to-generate')
      } catch (error) {
        setSessionId(`error: ${error.message}`)
        setDistinctId(`error: ${error.message}`)
      }
    }
  }, [posthog])

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Edge Runtime + PostHog Crypto Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded bg-purple-50">
          <h2 className="text-xl font-semibold mb-2 text-purple-700">Edge Runtime Details</h2>
          <p><strong>Runtime:</strong> Edge (Vercel Edge Functions)</p>
          <p><strong>Context:</strong> Client-side rendering in Edge environment</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Crypto Availability</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {cryptoInfo}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">PostHog Edge Data</h2>
          <p><strong>Session ID:</strong> {sessionId}</p>
          <p><strong>Distinct ID:</strong> {distinctId}</p>
        </div>
        
        <div className="p-4 border rounded bg-yellow-50">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Expected Behavior</h2>
          <p className="text-sm">
            Edge Runtime has limited API access compared to Node.js runtime. 
            If crypto issues exist, they might manifest differently in the 
            Edge environment where global crypto might not be available.
          </p>
        </div>
      </div>
    </main>
  )
} 