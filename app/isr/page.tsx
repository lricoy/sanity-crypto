import dynamic from 'next/dynamic';

// Enable ISR with periodic revalidation - this forces rebuilds in production
export const revalidate = 10; // Revalidate every 10 seconds

// Dynamically import PostHog-related components to test different loading scenarios
const PostHogComponent = dynamic(() => import('./PostHogISRComponent'), {
  ssr: false,
  loading: () => <p>Loading PostHog component...</p>
});

// Server-side function that might trigger during ISR rebuilds
async function getISRData() {
  const timestamp = new Date().toISOString()
  const rebuildId = Math.random().toString(36).substring(7)
  
  // This runs during ISR - might trigger crypto issues during rebuild
  return {
    timestamp,
    rebuildId,
    renderType: 'ISR (Incremental Static Regeneration)',
    revalidateEvery: '10 seconds'
  }
}

export default async function ISRPage() {
  const isrData = await getISRData()

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">ISR + PostHog Crypto Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded bg-green-50">
          <h2 className="text-xl font-semibold mb-2 text-green-700">ISR Details</h2>
          <p><strong>Generated at:</strong> {isrData.timestamp}</p>
          <p><strong>Rebuild ID:</strong> {isrData.rebuildId}</p>
          <p><strong>Render Type:</strong> {isrData.renderType}</p>
          <p><strong>Revalidates:</strong> {isrData.revalidateEvery}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Dynamic PostHog Component</h2>
          <PostHogComponent />
        </div>
        
        <div className="p-4 border rounded bg-yellow-50">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Expected Behavior</h2>
          <p className="text-sm">
            ISR pages are rebuilt periodically in production. If crypto errors 
            exist, they might appear during these rebuilds when PostHog components 
            are dynamically imported and initialized in different build contexts.
            Refresh this page multiple times after deployment to trigger rebuilds.
          </p>
        </div>
      </div>
    </main>
  )
} 