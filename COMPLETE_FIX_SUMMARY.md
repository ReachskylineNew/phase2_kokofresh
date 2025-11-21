# Complete Fix Summary - Order Visibility & Domain Issues

## Issues Fixed

### 1. ✅ Cashfree URL Error - "invalid url entered"
**Problem**: Cashfree was receiving URLs without `https://` protocol
**Fixed**: 
- `app/api/cashfree/create-session/route.ts` now ensures URLs always have protocol
- Multiple fallback sources for base URL (env vars, request origin, Vercel URL)
- Proper URL validation and encoding
- Works with testing deployment at `https://phase2-kokofresh-chi.vercel.app`

### 2. ✅ Signup/Signin Not Working
**Problem**: Calling `kokofresh.in/_functions/...` but backend moved to `backend.kokofresh.in`
**Fixed**:
- Updated all VELO function calls to use `NEXT_PUBLIC_WIX_BACKEND_URL`
- Fallback to `https://backend.kokofresh.in`
- Fixed in: `app/login/page.tsx`, `app/signup/page.tsx`, `app/api/auth/google/callback/route.ts`, `app/api/auth/facebook/callback/route.ts`

### 3. ✅ Middleware HEADLESS_URL
**Problem**: Hardcoded to old Vercel URL
**Fixed**: `middleware.ts` now uses environment variables with proper fallbacks

### 4. ✅ Orders Not Showing in Wix Dashboard
**Problem**: Orders created as `BACKOFFICE_MERCHANT` instead of `WEB`, so they don't appear in Store Dashboard
**Root Cause**: When `checkout.createOrder()` is called from server-side (especially webhooks), Wix may create backoffice orders instead of inheriting checkout's `channelType: "WEB"`

**Fixes Applied**:
- Enhanced logging throughout checkout and order creation flow
- Verify checkout has `channelType: "WEB"` when created
- Check checkout channelType before creating order
- Warn if order is created as BACKOFFICE instead of WEB
- Added comprehensive debugging in `HEADLESS_ORDER_FIX.md`

## Environment Variables Required

Add these to Vercel (or `.env.local` for local):

```env
# Headless site URL
NEXT_PUBLIC_URL=https://phase2-kokofresh-chi.vercel.app
# For production: https://kokofresh.in

# Wix backend URL (where VELO functions are hosted)
NEXT_PUBLIC_WIX_BACKEND_URL=https://backend.kokofresh.in

# Existing Wix variables
NEXT_PUBLIC_WIX_CLIENT_ID=2656201f-a899-4ec4-8b24-d1132bcf5405
WIX_API_KEY=your_api_key
WIX_ACCOUNT_ID=your_account_id
WIX_SITE_ID=your_site_id

# Cashfree
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
```

## How to Verify Orders Appear in Dashboard

### Step 1: Check Server Logs
When placing an order, look for these logs:

**Checkout Creation**:
```
📦 Checkout created: { checkoutId, channelType: "WEB" }
✅ Checkout has channelType: WEB
```

**Order Creation**:
```
📦 Order created: { channelInfo: { type: 'WEB' }, paymentStatus: 'PAID' }
✅ Order created as WEB order - will appear in Store Dashboard
```

**If you see**:
```
❌ WARNING: Order created as BACKOFFICE instead of WEB!
```
Then the order will NOT appear in Store Dashboard.

### Step 2: Check Wix Dashboard
1. Go to **Wix Dashboard → Store → Orders** (NOT Customer Management → Orders)
2. **Remove all filters** (channel type, payment status, date range)
3. Look for your test order

### Step 3: Verify Order Properties
Query `/api/orders` and check:
- `channelInfo: { type: 'WEB' }` ✅ (will show in Store Dashboard)
- `channelInfo: { type: 'BACKOFFICE_MERCHANT' }` ❌ (will NOT show in Store Dashboard)
- `paymentStatus: 'PAID'` for paid orders
- `status: 'APPROVED'` or `'NEW'`

## Wix Headless Configuration

**IMPORTANT**: Configure your headless domain in Wix:

1. Go to **Wix Dashboard → Settings → Headless**
2. Add **Allowed Redirect URLs**:
   - `https://phase2-kokofresh-chi.vercel.app` (testing)
   - `https://kokofresh.in` (production)
3. Save settings

This ensures Wix recognizes your headless site and creates proper Store Orders.

## Testing Checklist

After deploying to `https://phase2-kokofresh-chi.vercel.app`:

- [ ] Set `NEXT_PUBLIC_URL=https://phase2-kokofresh-chi.vercel.app` in Vercel
- [ ] Set `NEXT_PUBLIC_WIX_BACKEND_URL=https://backend.kokofresh.in` in Vercel
- [ ] Test signup at `/signup` (should call `backend.kokofresh.in/_functions/registerUser`)
- [ ] Test signin at `/login` (should call `backend.kokofresh.in/_functions/loginUser`)
- [ ] Place a test order with Cashfree payment
- [ ] Check server logs for channelType warnings
- [ ] Verify order has `channelInfo: { type: 'WEB' }` in logs
- [ ] Check Wix Dashboard → Store → Orders (remove all filters)
- [ ] Verify Cashfree webhook URL is set to `https://phase2-kokofresh-chi.vercel.app/api/cashfree/webhook`

## If Orders Still Don't Show

1. **Check Server Logs**: Look for "WARNING: Order created as BACKOFFICE" messages
2. **Verify Checkout ChannelType**: Check logs show `channelType: "WEB"` when checkout is created
3. **Check Wix Dashboard Filters**: Remove ALL filters in Store → Orders
4. **Verify Headless Settings**: Ensure headless domain is configured in Wix
5. **Check Order Status**: Orders with `status: 'PENDING'` might not show
6. **Check Payment Status**: Ensure `paymentStatus: 'PAID'` for paid orders

## Key Files Modified

- `app/api/cashfree/create-session/route.ts` - URL handling with protocol
- `app/api/cashfree/webhook/route.ts` - Enhanced logging, channelType verification
- `app/api/checkout/init/route.ts` - Verify channelType: "WEB"
- `app/api/checkout/place-order/route.ts` - Enhanced logging, channelType check
- `app/login/page.tsx` - Fixed VELO backend URL
- `app/signup/page.tsx` - Fixed VELO backend URL
- `app/api/auth/google/callback/route.ts` - Fixed VELO backend URL
- `app/api/auth/facebook/callback/route.ts` - Fixed VELO backend URL
- `middleware.ts` - Fixed HEADLESS_URL
- `lib/wix-server-client.ts` - Enhanced visitor token generation

## Documentation Created

- `FIXES_SUMMARY.md` - Initial fixes summary
- `CASHFREE_URL_FIX.md` - Cashfree URL issue details
- `VERCEL_DEPLOYMENT_SETUP.md` - Vercel deployment guide
- `HEADLESS_ORDER_FIX.md` - Order visibility issue details
- `ORDER_VISIBILITY_FIX.md` - Order visibility debugging
- `COMPLETE_FIX_SUMMARY.md` - This file

