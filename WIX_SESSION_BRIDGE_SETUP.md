## Wix Session Bridge Setup

The checkout flow now looks for a Wix-hosted "session bridge" before redirecting to the native checkout. The bridge must live on the Wix domain (e.g. `https://www.kokofresh.in`) so that `wixMembersFrontend.applySessionToken()` can set Wix cookies.

### 1. Configure the bridge URL
- Add `NEXT_PUBLIC_WIX_SESSION_BRIDGE_URL` to your environment (Vercel dashboard or `.env`) with the absolute URL of the Wix page that will run the bridge code, e.g.
  ```
  NEXT_PUBLIC_WIX_SESSION_BRIDGE_URL=https://www.kokofresh.in/session-bridge
  ```
- The value is read in `context/cart-context.tsx`. When present, checkout will redirect there with `checkoutId`, `checkoutUrl`, `sessionToken`, and `source` query params.

### 2. Create the Wix bridge page
1. Create a hidden page in Wix (e.g. `session-bridge`).
2. Add the following Velo/Frontend code:
   ```javascript
   import wixLocation from 'wix-location';
   import wixWindow from 'wix-window';
   import wixMembersFrontend from 'wix-members-frontend';

   function getParam(name) {
     const query = wixLocation.query;
     return query && query[name] ? query[name] : null;
   }

   $w.onReady(async function () {
     const sessionToken = getParam('sessionToken');
     const checkoutUrl = getParam('checkoutUrl');

     if (!checkoutUrl) {
       console.warn('Missing checkoutUrl; sending visitor to checkout homepage');
       wixLocation.to('/checkout');
       return;
     }

     if (sessionToken) {
       try {
         await wixMembersFrontend.applySessionToken(sessionToken);
         console.log('Session token applied via bridge page');
       } catch (err) {
         console.warn('Failed to apply session token:', err);
       }
     }

     wixWindow.openLightbox && wixWindow.openLightbox('');
     wixLocation.to(checkoutUrl);
   });
   ```
3. Keep the page unpublished in menus; it only needs to handle redirects.

### 3. Verify locally
- Log in via Google/Facebook (sets `wixSession` in localStorage).
- Add to cart and click checkout. You should be redirected to the bridge URL first, then to the Wix checkout.
- In DevTools on the Wix checkout page, confirm you are authenticated (no "Have an account?" prompt, profile button active).

### 4. Fallback behaviour
- If the bridge URL is not configured or a session token is missing, the app falls back to the original Wix checkout URL.
- Monitor console logs (`🔁 Redirecting via Wix session bridge`) to ensure the bridge runs.

### 5. Security notes
- The session token behaves like a password. Ensure the bridge page is served over HTTPS, avoids logging the raw token, and optionally validates a short-lived `source`/timestamp before applying it.
- Clear or rotate session tokens regularly; the Next app still stores them in `localStorage` (`wixSession`).


