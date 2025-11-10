## Headless Checkout Plan

### Goals
- Keep shoppers inside the Next.js experience from cart through payment.
- Synchronize with Wix for inventory, pricing, promotions, taxes, and order creation.
- Support authenticated members (with Wix tokens) and guest checkout via visitor tokens.

### High-Level Flow
1. **Load cart + member context**
   - Use existing `CartContext` to read cart line items and totals.
   - Fetch current member/contact via `useUser` (falls back to visitor details).

2. **Checkout state machine**
   - `contactInfo` → `shippingInfo` → `payment` → `review/submit`.
   - Persist progress locally to allow page reloads.

3. **API endpoints (Next.js routes)**
   - `POST /api/checkout/init` → returns normalized cart, calculated totals, shipping/tax estimates via `wixClient.checkout.calculateTotals`.
   - `POST /api/checkout/update` → updates buyer/shipping info in Wix checkout draft.
   - `POST /api/checkout/payment-intent` → creates payment intent, retrieves PSP token requirements.
   - `POST /api/checkout/place-order` → captures payment + places order using `wixClient.checkout.placeOrder` and `payments` module.

4. **Payments**
   - Prefer Stripe (existing PCI-compliant UI) or Razorpay. Wix Payments SDK is limited; treat it as fallback.
   - Use PSP client widget (e.g. Stripe Elements) embedded in the payment step. Our server stores payment intent IDs in the Wix checkout custom fields.

5. **Data model in frontend**
   ```ts
   type CheckoutState = {
     buyer: {
       email: string;
       phone?: string;
       firstName?: string;
       lastName?: string;
     };
     shippingAddress: {
       line1: string;
       line2?: string;
       city: string;
       region: string;
       postalCode: string;
       country: string;
     } | null;
     shippingOptionId?: string;
     payment: {
       provider: 'stripe' | 'razorpay';
       paymentIntentId?: string;
     } | null;
   };
   ```

6. **Validation**
   - Client-side: Zod schemas.
   - Server-side: Validate before calling Wix APIs.

7. **Order confirmation**
   - After successful `place-order`, redirect to `checkout/confirmation?orderId=...`.
   - Fetch order from `wixClient.orders.getOrder()` for display.

### Risks & Mitigations
- **Payment PCI scope:** Use PSP-hosted fields.
- **Taxes/shipping accuracy:** Always rely on `calculateTotals` and `updateCheckout` responses rather than local math.
- **Token expiry:** Refresh visitor/member tokens using existing context before each API call.
- **Reconciliation with Wix dashboard:** Orders placed via API appear normally if we use `currentCart` → `checkout` methods.

### Immediate Next Steps
1. Build headless checkout page scaffolding with stepper UI and mock data.
2. Implement `/api/checkout/init` and integrate with the page to replace mock data.
3. Add payment provider sandbox integration.
4. Harden error handling, analytics, and success page.


