# Vercel Crypto Issue Reproduction

This project reproduces the "crypto is not defined" error that occurs when deploying PostHog applications to Vercel.

## The Issue

When deploying to Vercel, the build process uses `esbuild-register` which creates an environment where:
- `window.crypto` exists and is available
- The global `crypto` object is **not** available
- This causes PostHog's UUID generation to fail during build

## Error Message

```
ReferenceError: crypto is not defined
    at Object.<anonymous> (~/node_modules/posthog-js/src/uuidv7.ts:222:46)
    at Object.newLoader [as .js] (~/node_modules/esbuild-register/dist/node.js:2262:9)
```

## Reproduction Steps

### Local Testing (Should Work)
```bash
npm install
npm run build
```

### Vercel Deployment (Will Fail Before Fix)
1. Connect this repo to Vercel
2. Deploy - build will fail with crypto error
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

- `app/page.tsx` - Uses PostHog hooks that trigger UUID generation
- `app/layout.tsx` - PostHog provider setup
- `package.json` - PostHog version that has the issue

## Expected Behavior

- ✅ **Local development**: Works fine
- ❌ **Vercel deployment (before fix)**: Build fails with crypto error  
- ✅ **Vercel deployment (after fix)**: Build succeeds

## Root Cause

The issue is specifically with `esbuild-register` used by Vercel's build system, which provides `window.crypto` but not the global `crypto` object during the transformation process. 