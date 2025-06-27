// PostHog configuration that gets loaded during Sanity config processing
// This triggers the crypto error in Vercel's esbuild-register environment

import { PostHog } from 'posthog-js'

// Initialize PostHog - this will trigger uuidv7() and cause crypto error
// during Vercel's esbuild-register processing of Sanity config
export const posthog = new PostHog()

// Configure PostHog - this will trigger UUID generation during initialization
// In Vercel's esbuild-register environment, this fails with "crypto is not defined"
posthog.init('phc_demo_key_for_reproduction_purposes', {
  api_host: 'https://app.posthog.com',
  // These options will trigger UUID generation during initialization
  bootstrap: {
    distinctID: undefined, // Forces generation
    sessionID: undefined, // Forces generation  
  },
  // This will trigger session/distinct ID generation immediately
  loaded: (posthog) => {
    // These calls trigger the uuidv7() function that fails in Vercel
    posthog.get_session_id()
    posthog.get_distinct_id()
  }
})

// Export a function that Sanity config can call
export const trackSanityEvent = (eventName: string, properties?: Record<string, any>) => {
  return posthog.capture(eventName, properties)
} 