# Social Login Setup Guide

## Overview
This guide explains how to enable Google and Facebook social logins that sync with your Wix Members dashboard.

## Prerequisites
1. Wix site with Members area enabled
2. Google and Facebook apps configured in Wix (if using direct social login)
3. OAuth redirect URL configured: `https://yourdomain.com/auth/callback`

## Step 1: Enable Social Logins in Wix Dashboard

### Option A: Enable via Wix Dashboard (Recommended)
1. Go to your Wix dashboard
2. Navigate to **Settings** → **Members** → **Login Methods**
3. Enable **Google** and **Facebook** login options
4. Configure your Google/Facebook OAuth apps (if required)
5. Save settings

### Option B: Use Wix OAuth Flow (Current Implementation)
The current implementation uses Wix's OAuth flow, which automatically shows available social login options if they're enabled in your Wix site settings.

## Step 2: Configure OAuth Redirect URL

1. Go to Wix Developers → Your App → OAuth Settings
2. Add redirect URL: `https://yourdomain.com/auth/callback`
3. For local development: `http://localhost:3000/auth/callback`

## Step 3: How It Works

### Login Flow:
1. User clicks "Google" or "Facebook" button
2. App redirects to Wix OAuth page
3. Wix shows login options (email/password + social logins)
4. User selects Google/Facebook and authenticates
5. Wix redirects back to `/auth/callback` with OAuth code
6. App exchanges code for member tokens
7. Member data is synced with Wix Members dashboard

### Signup Flow:
1. User clicks "Google" or "Facebook" on signup page
2. Same OAuth flow as login
3. If user doesn't exist, Wix creates a new member automatically
4. Member is added to Wix Members dashboard

## Step 4: Verify Sync with Dashboard

After social login:
1. Go to Wix Dashboard → Members
2. You should see the new member with:
   - Email from Google/Facebook
   - Profile picture (if available)
   - Name from social account
   - Login method: Google/Facebook

## Troubleshooting

### Social login buttons not showing on Wix OAuth page:
- Check Wix dashboard: Settings → Members → Login Methods
- Ensure Google/Facebook are enabled
- Verify OAuth redirect URL is configured correctly

### Members not appearing in dashboard:
- Check Wix Members settings
- Verify member creation is enabled
- Check Wix logs for errors

### OAuth callback errors:
- Verify redirect URL matches exactly (including https/http)
- Check client ID is correct
- Ensure OAuth scope includes "members"

## Files Modified

1. **`app/login/page.tsx`** - Added social login buttons and handlers
2. **`app/signup/page.tsx`** - Added social signup handlers
3. **`app/auth/callback/page.tsx`** - OAuth callback handler
4. **`VELO_SOCIAL_LOGIN.js`** - Placeholder for future server-side handling

## Testing

1. Test Google login:
   - Click "Google" button on login page
   - Should redirect to Wix OAuth
   - Select Google and authenticate
   - Should redirect back and log in

2. Test Facebook login:
   - Click "Facebook" button on login page
   - Should redirect to Wix OAuth
   - Select Facebook and authenticate
   - Should redirect back and log in

3. Test signup:
   - Click "Google" or "Facebook" on signup page
   - Complete OAuth flow
   - New member should be created in Wix dashboard

## Notes

- Social logins require Wix OAuth flow (not direct Google/Facebook OAuth)
- Members created via social login are automatically synced with Wix dashboard
- Profile data (name, email, picture) is synced from social provider
- Custom login (email/password) still works via VELO backend

