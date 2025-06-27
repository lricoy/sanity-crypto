import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'

// This import will trigger the crypto error during Vercel's build process
// exactly like in real projects that use PostHog with Sanity
import { trackSanityEvent, posthog } from './lib/posthog'

// This call happens during config loading and will trigger the crypto error
// This is exactly how real projects fail - PostHog gets initialized during config processing
trackSanityEvent('sanity_config_loading', { 
  timestamp: Date.now(),
  environment: process.env.NODE_ENV || 'development'
})

// Force additional PostHog calls that trigger UUID generation
// These will fail in Vercel's esbuild-register environment
const sessionId = posthog.get_session_id()
const distinctId = posthog.get_distinct_id()

export default defineConfig({
  name: 'default',
  title: 'Sanity + PostHog Crypto Issue Demo',
  
  // Use your real Sanity project ID
  projectId: 'cv9aryrp',
  dataset: 'production',
  
  plugins: [visionTool()],
  
  schema: {
    types: [
      {
        name: 'post',
        type: 'document',
        title: 'Blog Post',
        fields: [
          {
            name: 'title',
            type: 'string',
            title: 'Title',
            validation: Rule => Rule.required()
          },
          {
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
              source: 'title',
              maxLength: 200
            }
          },
          {
            name: 'content',
            type: 'text',
            title: 'Content'
          },
          {
            name: 'publishedAt',
            type: 'datetime',
            title: 'Published At'
          }
        ]
      }
    ]
  }
}) 