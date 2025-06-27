'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

// Force aggressive PostHog usage during dynamic component loading
export default function PostHogISRComponent() {
  const [sessionId, setSessionId] = useState<string>('loading...')
  const [distinctId, setDistinctId] = useState<string>('loading...')
  const [generationAttempts, setGenerationAttempts] = useState<number>(0)
  const posthog = usePostHog()

  useEffect(() => {
    // Aggressively try to generate IDs multiple times
    // This simulates the behavior that might trigger crypto errors
    const generateIds = () => {
      if (posthog) {
        try {
          setGenerationAttempts(prev => prev + 1)
          
          // Force multiple UUID generations
          const session = posthog?.get_session_id()
          const distinct = posthog?.get_distinct_id()
          
          // Try to force additional UUID generation by calling reset
          posthog?.reset()
          const newSession = posthog?.get_session_id()
          const newDistinct = posthog?.get_distinct_id()
          
          setSessionId(session || 'failed-to-generate')
          setDistinctId(distinct || 'failed-to-generate')
          
          // Track some events to force more UUID generation
          posthog?.capture('isr_component_loaded', {
            component: 'PostHogISRComponent',
            loadTime: Date.now(),
            sessionBefore: session,
            sessionAfter: newSession,
            distinctBefore: distinct,
            distinctAfter: newDistinct
          })
          
        } catch (error) {
          setSessionId(`error: ${error.message}`)
          setDistinctId(`error: ${error.message}`)
        }
      }
    }

    // Try generating IDs immediately and after a delay
    generateIds()
    const timeout = setTimeout(generateIds, 100)
    
    return () => clearTimeout(timeout)
  }, [posthog])

  return (
    <div className="p-4 border rounded bg-indigo-50">
      <h3 className="text-lg font-semibold mb-2 text-indigo-700">Dynamic PostHog Component</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Component:</strong> Dynamically loaded (no SSR)</p>
        <p><strong>Generation Attempts:</strong> {generationAttempts}</p>
        <p><strong>Session ID:</strong> {sessionId}</p>
        <p><strong>Distinct ID:</strong> {distinctId}</p>
        <p className="text-indigo-600">
          This component is dynamically imported and forces multiple UUID 
          generations plus PostHog resets to maximize crypto API usage.
        </p>
      </div>
    </div>
  )
} 