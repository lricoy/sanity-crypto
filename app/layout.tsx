'use client'

import { PostHogProvider } from 'posthog-js/react'

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY

// Fail early if no API key is provided
if (!POSTHOG_API_KEY) {
  throw new Error('NEXT_PUBLIC_POSTHOG_API_KEY environment variable is required')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider 
          apiKey={POSTHOG_API_KEY}
          options={{
            api_host: 'https://app.posthog.com',
            // This will trigger UUID generation during initialization
            bootstrap: {
              distinctID: undefined, // Force generation
              sessionID: undefined, // Force generation
            }
          }}
        >
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
} 