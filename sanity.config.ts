import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'

import { posthog } from 'posthog-js'

// throw away project
posthog.init('phc_rYGjlO1TRm2LhHZlfhWMfkxIATN1pM4tZvwu4iPv6jf', {
  api_host: 'https://app.posthog.com',
})

export default defineConfig({
  name: 'default',
  title: 'Sanity + PostHog Crypto Issue Demo',
  
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