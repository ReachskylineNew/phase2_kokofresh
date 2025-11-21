# Vercel Deployment Setup for Testing

## Testing URL
Your site is deployed at: **https://phase2-kokofresh-chi.vercel.app**

## Fix for "invalid url entered" Error

The Cashfree payment integration now properly handles your Vercel testing deployment.

### Quick Fix - Set Environment Variable

**In Vercel Dashboard:**

1. Go to your project: https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Add new variable:
   - **Key**: `NEXT_PUBLIC_URL`
   - **Value**: `https://phase2-kokofresh-chi.vercel.app`
   - **Environment**: Select "Preview", "Production", or "Development" (or all)
4. Click **Save**
5. **Redeploy** your application

### How It Works

The code now automatically detects the correct URL in this order:

1. **`NEXT_PUBLIC_URL`** environment variable (if set)
2. **`VERCEL_URL`** environment variable (automatically set by Vercel)
3. **Request origin header** (from the incoming request)
4. **Fallback** to `https://kokofresh.in` in production

### Automatic Protocol Handling

The code automatically:
- ✅ Adds `https://` protocol if missing
- ✅ Validates URL format before sending to Cashfree
- ✅ Properly encodes URL parameters
- ✅ Logs the URLs being used for debugging

### Verify It's Working

After redeploying, check your server logs when creating a Cashfree payment session. You should see:

```
🌐 Base URL: https://phase2-kokofresh-chi.vercel.app
🔗 Return URL: https://phase2-kokofresh-chi.vercel.app/payment-success?checkoutId=...
📡 Notify URL: https://phase2-kokofresh-chi.vercel.app/api/cashfree/webhook
```

### For Production Deployment

When you're ready to deploy to `kokofresh.in`:

1. Update the environment variable:
   - **Key**: `NEXT_PUBLIC_URL`
   - **Value**: `https://kokofresh.in`
2. Redeploy

### Cashfree Webhook Configuration

Make sure your Cashfree webhook URL is set to:
```
https://phase2-kokofresh-chi.vercel.app/api/cashfree/webhook
```

(Update this when you move to production domain)

## Environment Variables Summary

**Required for testing:**
```env
NEXT_PUBLIC_URL=https://phase2-kokofresh-chi.vercel.app
```

**Other existing variables:**
```env
NEXT_PUBLIC_WIX_BACKEND_URL=https://backend.kokofresh.in
NEXT_PUBLIC_WIX_CLIENT_ID=2656201f-a899-4ec4-8b24-d1132bcf5405
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
WIX_API_KEY=your_wix_api_key
WIX_ACCOUNT_ID=your_wix_account_id
WIX_SITE_ID=your_wix_site_id
```

