# Google Social Login Sync Fix - Summary

## Issues Identified

1. **Field Mismatch**: VELO code was using `contactEmail` to query members, but should check both `loginEmail` and `contactEmail` for better compatibility
2. **Password Sync**: New users were created but not automatically logged in, requiring a separate frontend call that could fail
3. **Existing User Detection**: When existing users tried to login with social auth, the code didn't properly handle cases where they were created with email/password
4. **Session Token Handling**: Callback route wasn't properly converting session tokens to OAuth tokens for Wix SDK

## Fixes Applied

### 1. Updated VELO Code (`VELO_SOCIAL_LOGIN_FIXED.js`)

**Key Improvements:**
- ✅ Checks both `loginEmail` and `contactEmail` fields when looking up existing members
- ✅ Automatically logs in new users immediately after creation (no separate frontend call needed)
- ✅ Better error handling for existing email/password users
- ✅ Handles race conditions when member is created between check and registration
- ✅ Always returns `sessionToken` when possible for seamless login

**Changes:**
```javascript
// Before: Only checked contactEmail
const res = await query("Members/PrivateMembersData")
  .eq("contactEmail", email)

// After: Checks both fields
let res = await query("Members/PrivateMembersData")
  .eq("loginEmail", email)
// Fallback to contactEmail if not found
```

```javascript
// Before: Created user but didn't login
return ok({
  body: {
    status: "new_user_created",
    socialPassword, // Frontend had to call loginUser
  }
})

// After: Creates AND logs in immediately
sessionToken = await authentication.login(email, socialPassword);
return ok({
  body: {
    status: "logged_in",
    sessionToken, // Ready to use!
  }
})
```

### 2. Updated Google Callback Route

**Key Improvements:**
- ✅ Better error handling and logging
- ✅ Redirects to `/auth/callback` page to properly convert session tokens to OAuth tokens
- ✅ Handles all response cases from VELO function
- ✅ Sets cookies with proper expiration

**Flow:**
```
Google OAuth → Get user info → Call VELO syncSocialAuth
  ↓
VELO returns sessionToken
  ↓
Redirect to /auth/callback?sessionToken=xxx&provider=google
  ↓
/auth/callback converts sessionToken to OAuth tokens
  ↓
User is logged in ✅
```

## Deployment Steps

### Step 1: Deploy Updated VELO Code

1. Go to your Wix site dashboard
2. Navigate to **Dev Mode** → **Backend** → **HTTP Functions**
3. Open the `syncSocialAuth` function
4. Replace the code with the contents of `VELO_SOCIAL_LOGIN_FIXED.js`
5. Save and deploy

### Step 2: Verify Next.js Code

The Google callback route has been updated. Make sure:
- ✅ `app/api/auth/google/callback/route.ts` is updated
- ✅ Environment variables are set:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXT_PUBLIC_WIX_CLIENT_ID`

### Step 3: Test the Flow

1. **New User Signup:**
   - Go to `/signup`
   - Click "Sign up with Google"
   - Complete Google OAuth
   - Should be redirected to `/profile` and logged in

2. **Existing Social User Login:**
   - Go to `/login`
   - Click "Login with Google"
   - Should be redirected to `/profile` and logged in

3. **Existing Email/Password User:**
   - If user tries Google login but account exists with email/password
   - Should see error message asking to use email/password login

## How It Works Now

### New User Flow
```
User clicks "Sign up with Google"
  ↓
Google OAuth → Get user info
  ↓
VELO: Check if member exists (NO)
  ↓
VELO: Create member with social password
  ↓
VELO: Login immediately → Return sessionToken
  ↓
Next.js: Redirect to /auth/callback with sessionToken
  ↓
/auth/callback: Convert sessionToken to OAuth tokens
  ↓
User logged in ✅
```

### Existing Social User Flow
```
User clicks "Login with Google"
  ↓
Google OAuth → Get user info
  ↓
VELO: Check if member exists (YES)
  ↓
VELO: Login with social password → Return sessionToken
  ↓
Next.js: Redirect to /auth/callback with sessionToken
  ↓
/auth/callback: Convert sessionToken to OAuth tokens
  ↓
User logged in ✅
```

### Existing Email/Password User Flow
```
User clicks "Login with Google"
  ↓
Google OAuth → Get user info
  ↓
VELO: Check if member exists (YES)
  ↓
VELO: Try login with social password (FAILS)
  ↓
VELO: Return error "PASSWORD_MISMATCH"
  ↓
Next.js: Redirect to /login with error message
  ↓
User sees: "Account exists. Please use email/password login."
```

## Key Benefits

1. **Seamless Experience**: New users are automatically logged in after signup
2. **Better Compatibility**: Checks both email fields for member lookup
3. **Proper Token Conversion**: Session tokens are properly converted to OAuth tokens for Wix SDK
4. **Error Handling**: Clear error messages for edge cases
5. **Race Condition Handling**: Handles cases where member is created between check and registration

## Troubleshooting

### Issue: "Account exists but uses email/password login"
**Solution**: User needs to login with email/password instead of social login. This is expected behavior.

### Issue: Session token not working
**Solution**: Check that `/auth/callback` page is properly converting session tokens. Verify `NEXT_PUBLIC_WIX_CLIENT_ID` is set correctly.

### Issue: Member not found
**Solution**: Verify the VELO function is checking both `loginEmail` and `contactEmail` fields. Check Wix member data structure.

## Files Modified

1. ✅ `VELO_SOCIAL_LOGIN_FIXED.js` - New improved VELO code
2. ✅ `app/api/auth/google/callback/route.ts` - Updated callback handling

## Next Steps

1. Deploy the VELO code to your Wix site
2. Test the Google signup and login flows
3. Monitor logs for any errors
4. Consider applying similar fixes to Facebook login if needed

