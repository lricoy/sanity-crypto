import { PostHog } from 'posthog-js'

const POSTHOG_API_KEY = "phc_rYGjlO1TRm2LhHZlfhWMfkxIATN1pM4tZvwu4iPv6jf"

// Initialize PostHog - this will trigger uuidv7() and cause crypto error
// during Vercel's esbuild-register processing of Sanity config
export const posthog = new PostHog()

// Configure PostHog - this will trigger UUID generation during initialization
// In Vercel's esbuild-register environment, this fails with "crypto is not defined"
posthog.init(POSTHOG_API_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  bootstrap: {
    distinctID: undefined, // Forces generation
    sessionID: undefined, // Forces generation  
  },
  loaded: (posthog) => {
    // These calls trigger the uuidv7() function, which I think is the cause of the crypto error
    posthog.get_session_id()
    posthog.get_distinct_id()
  }
})

// Export a function that Sanity config can call
export const trackSanityEvent = (eventName: string, properties?: Record<string, any>) => {
  const distinctId = posthog.get_distinct_id()
  const sessionId = posthog.get_session_id()
  console.log('distinctId', distinctId)
  console.log('sessionId', sessionId)
  return posthog.capture(eventName, properties)
} 