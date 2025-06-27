# Sanity + PostHog Crypto Issue Reproduction

This project reproduces the "crypto is not defined" error that occurs when using PostHog with Sanity CMS, specifically during Vercel deployments.

## The Issue

When using Sanity CMS with PostHog, the build process uses `esbuild-register` during schema extraction which creates an environment where:
- `window.crypto` exists and is available
- The global `crypto` object is **not** available  
- This causes PostHog's UUID generation to fail during Sanity's build process

## Error Message

```
Error: Failed to load configuration file "/vercel/path0/sanity.config.ts"
Caused by:
ReferenceError: crypto is not defined
    at Object.<anonymous> (~/node_modules/posthog-js/src/uuidv7.ts:222:46)
    at Object.newLoader [as .js] (~/node_modules/esbuild-register/dist/node.js:2262:9)
```

## Reproduction Steps

### Local Testing (Should Work for Next.js, Fail for Sanity)
```bash
npm install
npm run build:next  # Next.js build - should work
npm run build:sanity  # Sanity schema extraction - will fail with crypto error
npm run build  # Full build - will fail on Sanity step
```

### Vercel Deployment (Will Fail)
1. Connect this repo to Vercel
2. Deploy - build will fail during Sanity schema extraction with crypto error
3. Apply the fix to PostHog's uuidv7.ts
4. Deploy again - build will succeed

## The Fix

In `uuidv7.ts`, change:

```typescript
// ❌ BROKEN - checks window.crypto but uses global crypto
if (window && !isUndefined(window.crypto) && crypto.getRandomValues) {
    getRandomValues = (buffer) => crypto.getRandomValues(buffer)
}
```

To:

```typescript
// ✅ FIXED - consistent object reference
if (window && !isUndefined(window.crypto) && isFunction(window.crypto.getRandomValues)) {
    const crypto = window.crypto
    getRandomValues = (buffer) => crypto.getRandomValues(buffer)
}
```

## Files to Check

- `app/page.tsx` - Uses PostHog hooks that trigger UUID generation (mimics the failing gist pattern)
- `app/layout.tsx` - PostHog provider setup
- `sanity.config.ts` - Sanity configuration that triggers the build failure
- `package.json` - PostHog and Sanity versions that reproduce the issue

## Expected Behavior

- ✅ **Local development**: Works fine
- ✅ **Next.js build only**: Works fine  
- ❌ **Sanity schema extraction**: Fails with crypto error
- ❌ **Full build**: Fails on Sanity step
- ❌ **Vercel deployment**: Build fails during Sanity processing
- ✅ **After applying PostHog fix**: All builds succeed

## Root Cause

The issue occurs when Sanity's build process uses `esbuild-register` for configuration loading, which provides `window.crypto` but not the global `crypto` object. PostHog's `uuidv7.ts` checks for `window.crypto` availability but then tries to use the global `crypto` object, causing the failure.

This is the exact same issue reported in the referenced gists where Sanity builds fail due to PostHog's crypto usage pattern. 