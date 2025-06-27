'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [distinctId, setDistinctId] = useState<string>('')
  const posthog = usePostHog()

  useEffect(() => {
    // This will trigger PostHog's UUID generation during SSR/build
    if (posthog) {
      const session = posthog.get_session_id()
      const distinct = posthog.get_distinct_id()
      
      setSessionId(session || '')
      setDistinctId(distinct || '')
    }
  }, [posthog])

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Vercel Crypto Issue Reproduction</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">PostHog Data</h2>
          <p><strong>Session ID:</strong> {sessionId}</p>
          <p><strong>Distinct ID:</strong> {distinctId}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Issue Description</h2>
          <p>
            This page uses PostHog which internally calls uuidv7() during initialization.
            The crypto error occurs during Vercel's build process when esbuild-register
            tries to transform the PostHog code.
          </p>
        </div>
        
        <div className="p-4 border rounded bg-red-50">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Expected Error (Before Fix)</h2>
          <code className="text-sm text-red-600">
            ReferenceError: crypto is not defined<br/>
            at Object.&lt;anonymous&gt; (~/node_modules/posthog-js/src/uuidv7.ts:222:46)<br/>
            at esbuild-register transformation
          </code>
        </div>
      </div>
    </main>
  )
} 