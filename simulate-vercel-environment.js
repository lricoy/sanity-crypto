#!/usr/bin/env node

/**
 * This script simulates the Vercel esbuild-register environment
 * where window.crypto exists but global crypto is undefined
 */

console.log('🔧 Simulating Vercel esbuild-register environment...\n');

// Simulate the problematic environment
global.window = {
  crypto: {
    getRandomValues: function(buffer) {
      // Mock Web Crypto API
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    }
  }
};

// Ensure global crypto is undefined (like in esbuild-register)
if (global.crypto) {
  console.log('⚠️  Global crypto exists, deleting to simulate issue...');
  delete global.crypto;
}

console.log('Environment setup:');
console.log('- typeof window:', typeof global.window);
console.log('- typeof window.crypto:', typeof global.window?.crypto);
console.log('- typeof window.crypto.getRandomValues:', typeof global.window?.crypto?.getRandomValues);
console.log('- typeof crypto (global):', typeof global.crypto);
console.log('');

// Test the problematic code pattern
console.log('❌ Testing BROKEN pattern (original code):');
try {
  // This simulates the original problematic code
  const { window } = global;
  const isUndefined = (val) => val === undefined;
  
  if (window && !isUndefined(window.crypto) && crypto.getRandomValues) {
    console.log('✅ Would use Web Crypto API');
  } else {
    console.log('⚠️  Would fallback to Math.random');
  }
} catch (error) {
  console.log('💥 ERROR:', error.message);
}

console.log('');

// Test the fixed code pattern  
console.log('✅ Testing FIXED pattern (after fix):');
try {
  // This simulates the fixed code
  const { window } = global;
  const isUndefined = (val) => val === undefined;
  const isFunction = (val) => typeof val === 'function';
  
  if (window && !isUndefined(window.crypto) && isFunction(window.crypto.getRandomValues)) {
    const crypto = window.crypto;
    console.log('✅ Successfully uses window.crypto.getRandomValues');
    
    // Test it actually works
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    console.log('✅ Generated random value:', buffer[0]);
  } else {
    console.log('⚠️  Would fallback to Math.random');
  }
} catch (error) {
  console.log('💥 ERROR:', error.message);
}

console.log('\n🎯 Summary:');
console.log('- Original code: Checks window.crypto but uses global crypto → FAILS');
console.log('- Fixed code: Uses window.crypto consistently → WORKS');
console.log('\nThis demonstrates the exact Vercel esbuild-register issue! 🚀'); 