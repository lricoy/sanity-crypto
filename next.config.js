/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This might trigger esbuild-register scenarios
    serverComponentsExternalPackages: ['posthog-js']
  },
  // Ensure we're using the environment that might cause issues
  webpack: (config, { isServer }) => {
    // This configuration might trigger the problematic environment
    if (isServer) {
      config.externals = [...config.externals, 'posthog-js']
    }
    return config
  }
}

module.exports = nextConfig 