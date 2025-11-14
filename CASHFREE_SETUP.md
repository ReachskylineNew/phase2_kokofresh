# Cashfree Payment Integration Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Cashfree Configuration
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
NEXT_PUBLIC_URL=https://yourdomain.com
```

## Getting Cashfree Credentials

1. Sign up at [Cashfree](https://www.cashfree.com/)
2. Go to Dashboard → Payment Gateway → API Keys
3. Copy your App ID and Secret Key
4. Use sandbox credentials for testing

## Testing

### Test Cards
- **Success:** 4111 1111 1111 1111 (any expiry, any CVV)
- **Failure:** 4000 0000 0000 0002 (any expiry, any CVV)

### Webhook URL
Set webhook URL in Cashfree dashboard to:
```
https://yourdomain.com/api/cashfree/webhook
```

## Payment Flow

1. User clicks "Pay with Cashfree"
2. Frontend calls `/api/cashfree/create-session`
3. User redirected to Cashfree hosted checkout
4. After payment, user returns to `/payment-success`
5. Success page calls `/api/checkout/place-order` with `paymentMethod: "cashfree"`
6. Wix order created with Cashfree payment details

## Supported Payment Methods

- **COD (Cash on Delivery)** - Manual payment
- **Cashfree** - Online payment gateway

## Error Handling

- Invalid signatures are rejected
- Failed payments redirect back with error
- Webhook failures are logged but don't break flow
- All errors return proper HTTP status codes
