# Headless Checkout Setup Guide

## Overview

The headless checkout system allows customers to complete their purchase entirely within the Next.js application, without redirecting to Wix's hosted checkout. This provides a seamless experience and keeps users authenticated throughout the process.

## Architecture

### Flow
1. **Cart → Checkout Init**: When user clicks "Proceed to Checkout", they're redirected to `/checkout`
2. **Contact Step**: User enters email, phone, name
3. **Delivery Step**: User enters shipping address and selects shipping method
4. **Payment Step**: User selects payment method (COD or online) and reviews order
5. **Order Placement**: Order is placed via Wix API and user is redirected to confirmation page

### API Endpoints

#### `POST /api/checkout/init`
Initializes checkout from current cart. Returns:
- `checkoutId`: Wix checkout ID
- `totals`: Calculated totals (subtotal, tax, shipping, discount, total)
- `shippingOptions`: Available shipping methods from Wix
- `lineItems`: Cart items

#### `POST /api/checkout/update`
Updates checkout with buyer info and shipping address. Returns:
- Updated `checkout` object
- Recalculated `totals`

#### `POST /api/checkout/place-order`
Places the order. Accepts:
- `checkoutId`: Wix checkout ID
- `paymentMethod`: "cod" or "online"
- `paymentIntentId` / `paymentToken`: For online payments (future)

Returns:
- `orderId`: Created order ID
- `orderNumber`: Human-readable order number
- `order`: Full order object

## Features

### ✅ Implemented
- Multi-step checkout UI (Contact → Delivery → Payment)
- Wix checkout initialization and updates
- Real-time totals calculation (taxes, shipping, discounts)
- Dynamic shipping options from Wix
- COD (Cash on Delivery) payment method
- Order placement and confirmation page
- Pre-filled contact info for logged-in users
- Order summary with live totals

### 🚧 Pending (Future Enhancements)
- Online payment integration (Stripe/Razorpay)
- Payment intent creation and tokenization
- Coupon/promo code application
- Gift card support
- Address validation
- Saved addresses for logged-in users

## Configuration

### Environment Variables
No additional environment variables are required. The checkout uses existing Wix credentials:
- `NEXT_PUBLIC_WIX_CLIENT_ID`
- `WIX_API_KEY`
- `WIX_SITE_ID`
- `WIX_ACCOUNT_ID`

### Wix Settings
Ensure your Wix store has:
- Shipping methods configured
- Tax rules set up
- Payment methods enabled (at minimum, manual/COD)

## Usage

### For Customers
1. Add items to cart
2. Click "Proceed to Checkout" from cart page
3. Complete contact information
4. Enter shipping address and select shipping method
5. Review order and select payment method
6. Accept terms and place order
7. View order confirmation

### For Developers

#### Testing the Flow
```bash
# Start the development server
npm run dev

# Navigate to shop, add items to cart
# Click checkout and test the flow
```

#### Debugging
- Check browser console for API calls and responses
- Check server logs for Wix API errors
- Verify Wix credentials are set correctly
- Ensure cart has items before testing checkout

## Order Confirmation

After successful order placement, users are redirected to `/checkout/confirmation?orderId=...` which displays:
- Order number
- Order items
- Order totals
- Shipping address
- Contact information
- Next steps

## Error Handling

The checkout handles:
- Empty cart → Shows empty cart message
- API failures → Shows error toast and prevents progression
- Invalid checkout state → Redirects to shop
- Missing order → Shows error on confirmation page

## Security Considerations

- All API calls are server-side (Next.js API routes)
- Payment tokens/intents should never be exposed to client
- Order placement requires valid checkout ID
- Wix handles payment processing securely

## Future Payment Integration

To add online payments:

1. **Choose Payment Provider**
   - Stripe (recommended for PCI compliance)
   - Razorpay (popular in India)
   - Wix Payments (if available via API)

2. **Implementation Steps**
   - Create payment intent on server (`/api/checkout/payment-intent`)
   - Embed payment widget in payment step
   - Capture payment token
   - Pass token to `place-order` endpoint
   - Handle payment confirmation

3. **Example Flow**
   ```typescript
   // In payment step
   const paymentIntent = await createPaymentIntent(checkoutId, amount);
   // Show Stripe Elements or Razorpay widget
   const paymentToken = await capturePayment(paymentIntent);
   // Place order with token
   await placeOrder(checkoutId, { paymentMethod: "online", paymentToken });
   ```

## Troubleshooting

### Checkout not initializing
- Verify cart has items
- Check Wix API credentials
- Review server logs for errors

### Totals not updating
- Ensure shipping address is valid
- Check Wix shipping rules configuration
- Verify tax settings in Wix

### Order placement fails
- Verify checkout ID is valid
- Check Wix payment method configuration
- Review order placement API logs

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify Wix store configuration
3. Test with a simple cart (1 item)
4. Review browser console for client-side errors

