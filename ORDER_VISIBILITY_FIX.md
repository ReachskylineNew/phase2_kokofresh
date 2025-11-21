# Order Visibility Issue in Wix Dashboard

## Problem
Orders are being created via API (visible in `/api/orders`) but not showing in Wix dashboard.

## Analysis of Your Orders

Looking at your order data:
- **Recent orders (10051, 10050, 10049, 10048)**: Have `channelInfo: { type: 'BACKOFFICE_MERCHANT' }` and `paymentStatus: 'NOT_PAID'` - these are manually created test orders
- **Working orders (10046, 10045, etc.)**: Have `channelInfo: { type: 'WEB' }` and `paymentStatus: 'PAID'` - these are from headless checkout

## Root Causes

1. **Channel Type**: Orders created via headless checkout should have `channelInfo: { type: 'WEB' }` but might be getting wrong type
2. **Payment Status**: Cashfree orders should have `paymentStatus: 'PAID'` but might be `NOT_PAID`
3. **Dashboard Filters**: Wix dashboard might be filtering by channel type or payment status

## Fixes Applied

1. **Enhanced Logging**: Added detailed logging to track:
   - Order creation payload
   - Order response including channelInfo and paymentStatus
   - Checkout details before order creation

2. **Better Error Handling**: Improved error messages to show what's happening during order creation

3. **Payment Info Validation**: Ensures payment details are properly passed to Wix

## How to Debug

### Check Server Logs
When placing an order, look for these logs:
```
📦 Creating order with payload: {...}
📦 Order created: { orderId, orderNumber, paymentStatus, channelInfo }
✅ Wix Order Created: { orderId, orderNumber, paymentStatus, channelInfo }
```

### Check Wix Dashboard Filters
1. Go to Wix Dashboard → Orders
2. Check if any filters are applied:
   - Channel type filter
   - Payment status filter
   - Date range filter
3. Try removing all filters to see all orders

### Verify Order Creation
1. Place a test order via your headless site
2. Check server logs for order creation
3. Query `/api/orders` to see if order exists
4. Check Wix dashboard with no filters

## Expected Behavior

After Cashfree payment:
- Order should have `channelInfo: { type: 'WEB' }`
- Order should have `paymentStatus: 'PAID'`
- Order should have `checkoutId` field
- Order should appear in Wix dashboard under "Web" channel

## If Orders Still Don't Show

1. **Check Wix Dashboard Settings**:
   - Go to Settings → Orders
   - Verify order visibility settings
   - Check if there are any custom filters

2. **Verify Webhook is Firing**:
   - Check Cashfree dashboard for webhook delivery
   - Check server logs for webhook receipt
   - Verify webhook URL is correct

3. **Check Order Status**:
   - Orders with `status: 'PENDING'` might not show
   - Orders should have `status: 'APPROVED'`

4. **API Key Permissions**:
   - Verify WIX_API_KEY has order read/write permissions
   - Check if using correct site ID

## Next Steps

1. Deploy the updated code
2. Place a test order
3. Check server logs for the detailed order creation info
4. Verify the order appears in Wix dashboard
5. If not, check dashboard filters and order status

