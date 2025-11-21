# Fixes Summary - Domain Configuration and Order Issues

## Issues Fixed

### 1. Cashfree Payment URLs
**Problem**: Cashfree return_url and notify_url were hardcoded to `https://phase2-kokofresh-chi.vercel.app` instead of using the actual domain. Also getting "invalid url entered" error when URL was missing protocol.

**Solution**: 
- Updated `app/api/cashfree/create-session/route.ts` to use environment variables
- Now uses `NEXT_PUBLIC_URL` or `NEXT_PUBLIC_SITE_URL` with multiple fallbacks
- Automatically adds `https://` or `http://` protocol if missing
- Falls back to request origin if environment variables not set
- Validates URLs before sending to Cashfree
- Properly encodes checkoutId in URL parameters
- Added comprehensive logging to debug URL issues
- Both `return_url` and `notify_url` now dynamically use the correct domain with proper protocol

### 2. Wix VELO Backend URLs
**Problem**: Signup and signin were calling `https://kokofresh.in/_functions/...` but the Wix backend was moved to `backend.kokofresh.in`.

**Solution**:
- Updated `app/signup/page.tsx` to use `NEXT_PUBLIC_WIX_BACKEND_URL` with fallback to `https://backend.kokofresh.in`
- Updated `app/login/page.tsx` to use `NEXT_PUBLIC_WIX_BACKEND_URL` with fallback to `https://backend.kokofresh.in`
- Updated `app/api/auth/google/callback/route.ts` to use the environment variable
- Updated `app/api/auth/facebook/callback/route.ts` to use the environment variable
- All VELO function calls now point to `backend.kokofresh.in` instead of `kokofresh.in`

### 3. Middleware HEADLESS_URL
**Problem**: Middleware was using hardcoded `https://kokofresh-new.vercel.app` instead of the actual headless site domain.

**Solution**:
- Updated `middleware.ts` to use `NEXT_PUBLIC_URL` or `NEXT_PUBLIC_SITE_URL` with fallback to `https://kokofresh.in`
- Now correctly redirects from Wix site to headless site

### 4. Wix Order Creation Issues
**Problem**: Orders were not being created in Wix after Cashfree payment, or orders were showing as invalid.

**Solutions**:
- Enhanced `lib/wix-server-client.ts` to automatically generate visitor tokens when no user tokens are available (critical for webhooks)
- Added `orders` module to the Wix client for better order querying
- Improved `app/api/cashfree/webhook/route.ts` with:
  - Better error handling and logging
  - Checkout validation before order creation
  - Improved checkoutId extraction from Cashfree order_id
  - Fallback to get amount from checkout if order_amount is missing
  - Better duplicate order detection
  - More detailed error messages for debugging
  - Validation that checkout exists before attempting order creation
- Enhanced `app/api/checkout/place-order/route.ts` with:
  - Duplicate order checking before creation
  - Graceful handling when webhook already created the order
  - Better error handling for duplicate order scenarios
  - Returns existing order if found instead of failing

## Environment Variables Required

Add these to your `.env.local` or production environment:

```env
# Headless site URL (kokofresh.in)
NEXT_PUBLIC_URL=https://kokofresh.in
# OR
NEXT_PUBLIC_SITE_URL=https://kokofresh.in

# Wix backend URL (backend.kokofresh.in)
NEXT_PUBLIC_WIX_BACKEND_URL=https://backend.kokofresh.in

# Existing Wix variables
NEXT_PUBLIC_WIX_CLIENT_ID=2656201f-a899-4ec4-8b24-d1132bcf5405
WIX_API_KEY=your_api_key
WIX_ACCOUNT_ID=your_account_id
WIX_SITE_ID=your_site_id

# Cashfree variables
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
```

## Additional Notes

1. **Webhook Authentication**: The webhook now automatically generates visitor tokens if no user tokens are available, which is essential for server-to-server webhook calls from Cashfree.

2. **Order Creation Flow**: 
   - Cashfree webhook receives payment confirmation
   - Webhook validates checkout exists
   - Webhook checks for duplicate orders
   - Webhook creates Wix order with payment details
   - Payment success page also attempts to create order (webhook usually wins due to timing)

3. **Signup/Signin**: All authentication endpoints now correctly point to `backend.kokofresh.in` where the VELO functions are hosted.

## Testing Checklist

- [ ] Verify signup works at `/signup` (should call `backend.kokofresh.in/_functions/registerUser`)
- [ ] Verify signin works at `/login` (should call `backend.kokofresh.in/_functions/loginUser`)
- [ ] Verify social login (Google/Facebook) works (should call `backend.kokofresh.in/_functions/syncSocialAuth`)
- [ ] Test Cashfree payment flow end-to-end
- [ ] Verify orders appear in Wix dashboard after payment
- [ ] Check Cashfree webhook is receiving callbacks
- [ ] Verify webhook URL in Cashfree dashboard is set to `https://kokofresh.in/api/cashfree/webhook`
- [ ] Test that duplicate orders are not created
- [ ] Verify environment variables are set in production
- [ ] Check that Cashfree return_url redirects to correct domain

## Cashfree Webhook Configuration

Make sure the webhook URL in your Cashfree dashboard is set to:
```
https://kokofresh.in/api/cashfree/webhook
```

Or if using a different domain:
```
https://YOUR_DOMAIN/api/cashfree/webhook
```

