# Custom Social Auth Setup Guide

This guide explains how to set up custom Google and Facebook OAuth authentication that syncs with Wix Members.

## Overview

Instead of using Wix's default social login buttons, this implementation:
1. Uses your own Google and Facebook OAuth apps
2. Authenticates users directly with Google/Facebook
3. Syncs authenticated users with Wix Members via VELO backend
4. Creates or logs in members automatically

## Prerequisites

1. Google Cloud Console account
2. Facebook Developer account
3. Wix site with Members enabled
4. VELO backend access

## Step 1: Set Up Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** (or **Google Identity API**)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy your **Client ID** and **Client Secret**

### 1.2 Add Environment Variables

Add to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 2: Set Up Facebook OAuth

### 2.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Add **Valid OAuth Redirect URIs**:
   - `http://localhost:3000/api/auth/facebook/callback` (for development)
   - `https://yourdomain.com/api/auth/facebook/callback` (for production)
6. Copy your **App ID** and **App Secret**

### 2.2 Add Environment Variables

Add to your `.env.local` file:

```env
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

## Step 3: Deploy VELO Backend Function

### 3.1 Upload VELO Function

1. Go to your Wix site dashboard
2. Navigate to **Dev Mode** → **Backend** → **HTTP Functions**
3. Create a new HTTP function called `syncSocialAuth`
4. Copy the code from `VELO_SYNC_SOCIAL_AUTH.js`
5. Deploy the function

### 3.2 Function Endpoint

The function will be available at:
```
https://your-wix-site.com/_functions/syncSocialAuth
```

## Step 4: Test the Implementation

### 4.1 Test Google Login

1. Start your Next.js app: `npm run dev`
2. Go to `/login` page
3. Click **Google** button
4. Complete Google OAuth flow
5. You should be redirected to `/profile` after successful login

### 4.2 Test Facebook Login

1. Go to `/login` page
2. Click **Facebook** button
3. Complete Facebook OAuth flow
4. You should be redirected to `/profile` after successful login

## How It Works

### Flow Diagram

```
User clicks Google/Facebook button
    ↓
Redirect to Google/Facebook OAuth
    ↓
User authenticates with provider
    ↓
Provider redirects to /api/auth/{provider}/callback
    ↓
Exchange code for access token
    ↓
Fetch user info from provider
    ↓
Call VELO syncSocialAuth function
    ↓
VELO checks if member exists
    ↓
If new: Create member + Login → Return session token
If exists: Try login with social password → Return session token
    ↓
Frontend receives session token
    ↓
Convert session token to Wix OAuth tokens
    ↓
Store tokens in cookies
    ↓
User is logged in ✅
```

### Key Components

1. **API Routes** (`app/api/auth/`):
   - `/api/auth/google` - Initiates Google OAuth
   - `/api/auth/google/callback` - Handles Google OAuth callback
   - `/api/auth/facebook` - Initiates Facebook OAuth
   - `/api/auth/facebook/callback` - Handles Facebook OAuth callback

2. **VELO Backend** (`VELO_SYNC_SOCIAL_AUTH.js`):
   - Checks if member exists by email
   - Creates new member if doesn't exist
   - Logs in existing member (if created via social auth)
   - Returns session token

3. **Auth Callback Page** (`app/auth/callback/page.tsx`):
   - Receives session token from VELO
   - Converts session token to Wix OAuth tokens
   - Stores tokens and redirects to profile

## Troubleshooting

### Error: "OAuth not configured"
- Make sure you've added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, and `FACEBOOK_APP_SECRET` to your `.env.local` file
- Restart your Next.js dev server after adding environment variables

### Error: "Invalid redirect URI"
- Make sure you've added the correct redirect URIs in Google Cloud Console and Facebook App settings
- Google: `http://localhost:3000/api/auth/google/callback` (dev) or `https://yourdomain.com/api/auth/google/callback` (prod)
- Facebook: `http://localhost:3000/api/auth/facebook/callback` (dev) or `https://yourdomain.com/api/auth/facebook/callback` (prod)
- The redirect URI must match exactly

### Error: "Member exists but can't login via social auth"
- This happens when a member was created via email/password, not social auth
- The member needs to use email/password login, or you can manually link their account

### Error: "Failed to sync with Wix"
- Check that your VELO function is deployed and accessible
- Verify the function URL is correct: `https://your-wix-site.com/_functions/syncSocialAuth`
- Check VELO function logs for errors

## Security Notes

1. **Environment Variables**: Never commit `.env.local` to git. Add it to `.gitignore`.

2. **OAuth State**: The implementation uses state parameters and cookies to prevent CSRF attacks.

3. **Password Generation**: Social auth users get a deterministic password based on their email and provider. This allows them to login again via social auth.

4. **HTTPS**: Always use HTTPS in production. OAuth providers require secure redirect URIs.

## Next Steps

1. **Link Social Accounts**: For existing email/password users, you can add functionality to link their social accounts.

2. **Profile Picture Sync**: The implementation already syncs profile pictures from Google/Facebook.

3. **Account Merging**: If a user signs up with email, then tries to login with social auth (same email), you can add logic to merge accounts.

4. **Multiple Providers**: Users can use different social providers (Google or Facebook) with the same email - they'll be linked to the same Wix member.

## Support

If you encounter issues:
1. Check browser console for errors
2. Check VELO function logs in Wix dashboard
3. Verify all environment variables are set correctly
4. Ensure redirect URIs match in OAuth provider settings

