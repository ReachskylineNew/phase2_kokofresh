# Session Token to OAuth Tokens Conversion Solution

## Problem
The session token returned by VELO's `authentication.login()` cannot be converted to OAuth tokens using standard OAuth endpoints (returns "unsupported_grant_type" error).

## Current Implementation

### Frontend Approach
1. **Login Flow** (`app/login/page.tsx`):
   - Receives session token from VELO backend
   - Stores it in localStorage
   - Uses `authentication.applySessionToken()` from `@wix/members` to authenticate
   - Attempts to get OAuth tokens using `getMemberTokensForDirectLogin()`

2. **User Context** (`context/user-context.tsx`):
   - On app load, checks for `wixSession` in localStorage
   - Tries the same conversion process
   - Falls back to cookies if conversion succeeds

## Testing
Try logging in again. The new flow should:
1. Apply the session token using `applySessionToken()`
2. Attempt to get OAuth tokens using `getMemberTokensForDirectLogin()`
3. If successful, store tokens in cookies and proceed
4. If it fails, you'll see a warning but the session token is still stored

## Recommended Solution (Best Practice)

**Modify your VELO `post_loginUser` function** to return OAuth tokens directly after login. This is the most reliable approach.

### Option 1: Modify VELO to Return OAuth Tokens

Unfortunately, VELO's `authentication.login()` only returns a session token, and there's no direct VELO API to convert it to OAuth tokens server-side.

### Option 2: Use Wix OAuth Flow Instead

Consider using Wix's standard OAuth flow instead of custom login:
- Redirect to Wix OAuth login page
- Get OAuth tokens directly from the callback
- No conversion needed

### Option 3: Keep Using Session Token (Current Approach)

If `applySessionToken()` + `getMemberTokensForDirectLogin()` works, you're good to go!

## Next Steps

1. **Test the current implementation** - Try logging in and check the browser console
2. **If `getMemberTokensForDirectLogin()` still fails after `applySessionToken()`**:
   - Check Wix SDK documentation for the correct way to use session tokens
   - Consider switching to standard OAuth flow
   - Contact Wix support for guidance on session token conversion

3. **If it works**: Great! The flow is complete.

## Files Modified

- `app/login/page.tsx` - Updated login flow to use `applySessionToken()`
- `context/user-context.tsx` - Updated to use `applySessionToken()` on app load
- `app/api/convert-session/route.ts` - Created (though may not be needed if `applySessionToken()` works)

## Notes

- The session token from VELO is a Wix Members session token (JWS format)
- OAuth tokens are different and needed for the Wix SDK
- `applySessionToken()` authenticates the user session
- `getMemberTokensForDirectLogin()` should convert the session to OAuth tokens after authentication

