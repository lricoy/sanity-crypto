// Force SSR by using dynamic server-side features
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side function that might interact with crypto-dependent modules during SSR
async function getSSRData() {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(7)
  
  // Test crypto availability on server side
  let cryptoInfo = 'unknown'
  try {
    // Check what crypto APIs are available during SSR
    cryptoInfo = JSON.stringify({
      globalCrypto: typeof global.crypto,
      nodeCrypto: typeof require('crypto'),
      webCrypto: typeof globalThis.crypto
    })
  } catch (error) {
    cryptoInfo = `error: ${error.message}`
  }
  
  return {
    timestamp,
    requestId,
    cryptoInfo
  }
}

export default async function SSRPage() {
  const ssrData = await getSSRData()

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">SSR + Crypto Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded bg-blue-50">
          <h2 className="text-xl font-semibold mb-2 text-blue-700">SSR Details</h2>
          <p><strong>Rendered at:</strong> {ssrData.timestamp}</p>
          <p><strong>Request ID:</strong> {ssrData.requestId}</p>
          <p><strong>Rendering:</strong> Server-Side (force-dynamic)</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Server-Side Crypto Info</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {ssrData.cryptoInfo}
          </pre>
        </div>
        
        <div className="p-4 border rounded bg-yellow-50">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Expected Behavior</h2>
          <p className="text-sm">
            This page tests crypto API availability during SSR. If crypto errors 
            exist in this rendering mode, they would appear when modules that depend 
            on crypto (like PostHog's UUID generation) are imported during SSR.
          </p>
        </div>

        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Note</h2>
          <p className="text-sm">
            PostHog components are client-side only. The real test is whether 
            building this SSR page with crypto-dependent modules causes build failures.
          </p>
        </div>
      </div>
    </main>
  )
} 