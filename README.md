# Sanity + PostHog Crypto Issue Reproduction

This project tries to reproduces the "crypto is not defined" error that occurs when using PostHog with Sanity CMS, specifically during Vercel deployments.

Zendesk ticket: https://posthoghelp.zendesk.com/agent/tickets/33320

## Error Message

```
Error: Failed to load configuration file "/vercel/path0/sanity.config.ts"
Caused by:
ReferenceError: crypto is not defined
    at Object.<anonymous> (~/node_modules/posthog-js/src/uuidv7.ts:222:46)
    at Object.newLoader [as .js] (~/node_modules/esbuild-register/dist/node.js:2262:9)
```

## Reproduction Steps (Still not working)

### Vercel Deployment (Should Fail)
1. Connect this repo to Vercel
2. Deploy - build will fail during Sanity schema extraction (?) with crypto error

## Possible Fix

We could try changing this in `uuidv7.ts`:

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