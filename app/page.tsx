'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

// Component that mimics the pattern from the gist
const AppLinkWithParams = ({ children }: { children: React.ReactNode }) => {
  const [utmParams, setUtmParams] = useState<Record<string, string>>({})
  const posthog = usePostHog()

  // These calls will trigger PostHog's UUID generation during SSR/build
  const sessionId = posthog?.get_session_id()
  const distinctId = posthog?.get_distinct_id()

  useEffect(() => {
    // Simulate UTM params gathering
    const params = {
      utm_source: 'vercel-demo',
      utm_medium: 'crypto-test',
      utm_campaign: 'sanity-build'
    }
    setUtmParams(params)
  }, [])

  // Filter out undefined and empty string values
  const filteredUtmParams = Object.fromEntries(
    Object.entries(utmParams).filter(
      ([_, value]) => value && value.trim() !== ""
    )
  )

  // Build URL params object with only valid values
  const allParams: Record<string, string> = { ...filteredUtmParams }

  if (sessionId && sessionId.trim() !== "") {
    allParams.posthog_session_id = sessionId
  }

  if (distinctId && distinctId.trim() !== "") {
    allParams.posthog_distinct_id = distinctId
  }

  const queryString = new URLSearchParams(allParams).toString()
  const href = queryString
    ? `https://app.example.com/?${queryString}`
    : "https://app.example.com/"

  return (
    <a 
      href={href} 
      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [distinctId, setDistinctId] = useState<string>('')
  const posthog = usePostHog()

  useEffect(() => {
    // This will trigger PostHog's UUID generation during SSR/build
    // Exactly like the pattern that causes the Sanity build failure
    if (posthog) {
      const session = posthog.get_session_id()
      const distinct = posthog.get_distinct_id()
      
      setSessionId(session || '')
      setDistinctId(distinct || '')
    }
  }, [posthog])

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Sanity + PostHog Crypto Issue</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">PostHog Data</h2>
          <p><strong>Session ID:</strong> {sessionId}</p>
          <p><strong>Distinct ID:</strong> {distinctId}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Demo Component</h2>
          <p className="mb-4">
            This component uses the same PostHog pattern as the failing Sanity build:
          </p>
          <AppLinkWithParams>
            Go to App with PostHog Params
          </AppLinkWithParams>
        </div>
        
        <div className="p-4 border rounded bg-red-50">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Expected Build Error</h2>
          <code className="text-sm text-red-600 block whitespace-pre-wrap">
{`Error: Failed to load configuration file "/vercel/path0/sanity.config.ts"
Caused by:
ReferenceError: crypto is not defined
at Object.<anonymous> (~/node_modules/posthog-js/src/uuidv7.ts:222:46)
at Object.newLoader [as .js] (~/node_modules/esbuild-register/dist/node.js:2262:9)`}
          </code>
        </div>
        
        <div className="p-4 border rounded bg-yellow-50">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Root Cause</h2>
          <p className="text-sm">
            Sanity's build process uses esbuild-register which creates an environment where 
            window.crypto exists but global crypto is undefined. PostHog's uuidv7.ts checks 
            window.crypto but then uses global crypto, causing the failure.
          </p>
        </div>
      </div>
    </main>
  )
} 