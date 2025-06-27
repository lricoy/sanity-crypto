/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This will trigger esbuild-register scenarios during Sanity config processing
    serverComponentsExternalPackages: ['posthog-js']
  }
}

module.exports = nextConfig 