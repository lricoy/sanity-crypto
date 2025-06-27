'use client'

import { PostHogProvider } from 'posthog-js/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider 
          apiKey="phc_test_key_for_reproduction"
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