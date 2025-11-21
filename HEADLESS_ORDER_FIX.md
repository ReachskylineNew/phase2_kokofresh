# Headless Storefront Order Visibility Fix

## Problem
Orders created via headless checkout are not appearing in Wix Store Dashboard because they're being created as "Backoffice Orders" (`channelInfo: { type: 'BACKOFFICE_MERCHANT' }`) instead of "Store Orders" (`channelInfo: { type: 'WEB' }`).

## Root Cause
When using `checkout.createOrder()` from server-side (especially in webhooks with visitor tokens), Wix may create orders as "Backoffice Orders" instead of inheriting the checkout's `channelType: "WEB"`.

## Solution Applied

### 1. Enhanced Logging
Added comprehensive logging to track:
- Checkout `channelType` when created
- Checkout `channelType` when fetching before order creation
- Order `channelInfo` after creation
- Warnings if order is created as BACKOFFICE instead of WEB

### 2. Verification Points
- **Checkout Init** (`/api/checkout/init`): Verifies checkout is created with `channelType: "WEB"`
- **Place Order** (`/api/checkout/place-order`): Checks checkout channelType before creating order
- **Webhook** (`/api/cashfree/webhook`): Verifies checkout channelType and warns if order is BACKOFFICE

### 3. Key Requirements for Store Orders

For orders to appear in **Wix Store Dashboard** (not just Customer Management → Orders):

1. ✅ Checkout must be created with `channelType: "WEB"`
   ```js
   currentCart.createCheckoutFromCurrentCart({ channelType: "WEB" })
   ```

2. ✅ Order must be created from that checkout (not manually)
   ```js
   checkout.createOrder(checkoutId, paymentInfo)
   ```

3. ✅ Order should inherit `channelInfo: { type: 'WEB' }` from checkout

4. ✅ Order should have `paymentStatus: 'PAID'` for paid orders

## How to Verify

### Step 1: Check Server Logs
When placing an order, look for:
```
📦 Checkout created: { checkoutId, channelType: "WEB" }
🔍 Checkout channel type: WEB
📦 Order created: { channelInfo: { type: 'WEB' } }
✅ Order created as WEB order - will appear in Store Dashboard
```

If you see:
```
❌ WARNING: Order created as BACKOFFICE instead of WEB!
```
Then the order will NOT appear in Store Dashboard.

### Step 2: Check Wix Dashboard
1. Go to **Wix Dashboard → Store → Orders**
2. Remove all filters (channel type, payment status, etc.)
3. Look for orders with `channelInfo: { type: 'WEB' }`

### Step 3: Verify Checkout Creation
Check that checkouts are being created with `channelType: "WEB"`:
- Look for log: `📦 Checkout created: { channelType: "WEB" }`
- If you see a different channelType, the issue is in checkout creation

## Common Issues

### Issue 1: Checkout Created Without channelType
**Symptom**: Checkout has no channelType or wrong channelType
**Fix**: Ensure `createCheckoutFromCurrentCart({ channelType: "WEB" })` is called

### Issue 2: Order Created as BACKOFFICE
**Symptom**: Order has `channelInfo: { type: 'BACKOFFICE_MERCHANT' }`
**Possible Causes**:
- Checkout was created without `channelType: "WEB"`
- Using wrong authentication (API keys instead of OAuth)
- Checkout expired or invalid
**Fix**: Ensure checkout is created with `channelType: "WEB"` and order is created from that checkout

### Issue 3: Orders Show in API but Not Dashboard
**Symptom**: `/api/orders` returns orders but Wix Dashboard doesn't show them
**Cause**: Orders are BACKOFFICE orders, not Store orders
**Fix**: Follow the logging to identify where channelType is lost

## Wix Headless Settings

Ensure your headless domain is configured in Wix:

1. **Wix Dashboard → Settings → Headless**
2. Add allowed redirect URLs:
   - `https://phase2-kokofresh-chi.vercel.app`
   - `https://kokofresh.in` (for production)
3. Save settings

## Testing Checklist

After deploying:
- [ ] Place a test order via headless checkout
- [ ] Check server logs for channelType warnings
- [ ] Verify order has `channelInfo: { type: 'WEB' }` in logs
- [ ] Check Wix Dashboard → Store → Orders (not Customer Management)
- [ ] Verify order appears without filters
- [ ] Check order details show correct channel type

## If Orders Still Don't Show

1. **Check Wix Dashboard Filters**: Remove all filters in Store → Orders
2. **Check Order Status**: Orders with `status: 'PENDING'` might not show
3. **Check Payment Status**: Ensure `paymentStatus: 'PAID'` for paid orders
4. **Verify Checkout ChannelType**: Check logs to ensure checkout has `channelType: "WEB"`
5. **Check Wix Headless Settings**: Ensure headless domain is configured
6. **Review Authentication**: Ensure using OAuth tokens, not just API keys

## Important Notes

- **Backoffice Orders** (`BACKOFFICE_MERCHANT`) appear in "Customer Management → Orders" or "Manual Orders"
- **Store Orders** (`WEB`) appear in "Store → Orders" dashboard
- The `checkout.createOrder()` method SHOULD inherit channelType from checkout
- If it's not inheriting, the issue is likely in checkout creation or authentication context

