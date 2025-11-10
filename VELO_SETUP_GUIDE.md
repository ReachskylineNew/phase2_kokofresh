# VELO Backend Setup Guide

## Overview
Your VELO backend has two main functions:
1. `post_registerUser` - Handles user registration
2. `post_loginUser` - Handles user login and returns a session token

## Important Notes

### ❌ Session Token Conversion in VELO
**VELO cannot convert session tokens to OAuth tokens server-side.** There is no `wixAuth` module or similar API in VELO that can perform this conversion.

### ✅ Frontend Conversion
The conversion from session token to OAuth tokens **must happen on the frontend** using:
1. `authentication.applySessionToken(sessionToken)` from `@wix/members`
2. `wixClient.auth.getMemberTokensForDirectLogin(sessionToken)` from `@wix/sdk`

## Your VELO Functions

### 1. Register User (`post_registerUser`)
```javascript
// This function works correctly - no changes needed
// Returns: { status: "success", message: "...", member: {...} }
```

### 2. Login User (`post_loginUser`)
```javascript
// This function works correctly - no changes needed
// Returns: { status: "success", message: "...", sessionToken: "..." }
// The frontend will handle converting sessionToken to OAuth tokens
```

### 3. Convert Session Token (`post_convertSessionToken`) 
**❌ DO NOT USE THIS FUNCTION**
- This function cannot work in VELO because there's no way to convert session tokens server-side
- The frontend already handles this conversion automatically
- You can delete this function if you've created it

## Complete VELO Code

Copy the code from `VELO_LOGIN_COMPLETE.js` - it includes:
- ✅ Working registration function
- ✅ Working login function that returns session token
- ❌ Removed/disabled convertSessionToken function (not needed)

## Frontend Flow

1. User logs in → VELO `post_loginUser` returns `sessionToken`
2. Frontend stores `sessionToken` in localStorage
3. Frontend calls `authentication.applySessionToken(sessionToken)`
4. Frontend calls `wixClient.auth.getMemberTokensForDirectLogin(sessionToken)`
5. Frontend stores OAuth tokens in cookies
6. User is authenticated ✅

## Troubleshooting

### Error: "Cannot find name wixAuth"
- **Solution**: Remove any references to `wixAuth` - it doesn't exist in VELO
- The conversion must happen on the frontend

### Error: "unsupported_grant_type" when calling OAuth endpoints
- **Solution**: Don't call OAuth endpoints directly from VELO or frontend
- Use the Wix SDK methods instead: `applySessionToken()` + `getMemberTokensForDirectLogin()`

### Session token works but OAuth tokens don't
- Check that you're using the correct client ID
- Verify `applySessionToken()` is called before `getMemberTokensForDirectLogin()`
- Check browser console for detailed error messages

## Next Steps

1. ✅ Use the code from `VELO_LOGIN_COMPLETE.js` in your VELO backend
2. ✅ Remove any `convertSessionToken` function (not needed)
3. ✅ The frontend will handle all token conversion automatically
4. ✅ Test the login flow end-to-end

