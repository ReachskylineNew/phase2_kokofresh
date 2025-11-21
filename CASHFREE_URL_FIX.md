# Cashfree URL Fix - "invalid url entered" Error

## Problem
Getting error: `order_meta.return_url : invalid url entered. Value received: phase2-kokofresh-chi.vercel.app/payment-success?checkoutld=...`

This error occurs because:
1. The URL is missing the `https://` protocol
2. The environment variable `NEXT_PUBLIC_URL` is not set in production
3. The URL is falling back to an old hardcoded value

## Solution Applied

Updated `app/api/cashfree/create-session/route.ts` with:

1. **Multiple URL Sources**: 
   - First tries `NEXT_PUBLIC_URL` or `NEXT_PUBLIC_SITE_URL`
   - Falls back to request origin header
   - Final fallback to `https://kokofresh.in` in production

2. **Automatic Protocol Addition**:
   - Detects if URL is missing `http://` or `https://`
   - Automatically adds `https://` in production, `http://` in development

3. **URL Validation**:
   - Validates URL format before sending to Cashfree
   - Returns error if URL cannot be constructed
   - Removes trailing slashes

4. **Proper Encoding**:
   - URL-encodes checkoutId parameter
   - Ensures special characters are handled correctly

5. **Enhanced Logging**:
   - Logs base URL, return URL, and notify URL
   - Shows which environment variables are set
   - Helps debug URL construction issues

## Required Environment Variables

**IMPORTANT**: Set these in your production environment (Vercel, etc.):

```env
NEXT_PUBLIC_URL=https://kokofresh.in
```

Or alternatively:
```env
NEXT_PUBLIC_SITE_URL=https://kokofresh.in
```

## How to Set in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_URL` with value `https://kokofresh.in`
4. Make sure it's set for "Production" environment
5. Redeploy your application

## Testing

After setting the environment variable and redeploying:

1. Check server logs when creating Cashfree session
2. Look for logs showing:
   - `🌐 Base URL: https://kokofresh.in`
   - `🔗 Return URL: https://kokofresh.in/payment-success?checkoutId=...`
   - `📡 Notify URL: https://kokofresh.in/api/cashfree/webhook`
3. Verify the URLs have `https://` protocol
4. The error should no longer occur

## Fallback Behavior

If `NEXT_PUBLIC_URL` is not set, the system will:
1. Try to get URL from request origin header
2. Fall back to `https://kokofresh.in` in production
3. Fall back to `http://localhost:3000` in development
4. Always ensure protocol is present

## Note on "checkoutld" typo

The error message shows "checkoutld" instead of "checkoutId" - this appears to be a typo in Cashfree's error message display, not in our code. Our code correctly uses "checkoutId".

