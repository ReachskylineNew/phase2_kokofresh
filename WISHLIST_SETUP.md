# Wishlist Setup Guide

## Issue: "Failed to save item for later"

The wishlist functionality requires either:
1. **Wix Data Collection Setup** (for production)
2. **Mock Mode** (for testing)

## Option 1: Enable Mock Mode (Recommended for Testing)

Add this to your `.env.local` file:
```bash
USE_MOCK_WISHLIST=true
```

This will enable mock mode where wishlist items are stored in memory and work without Wix Data setup.

## Option 2: Setup Wix Data Collection (For Production)

### Step 1: Create Wishlist Collection in Wix

1. Go to your Wix dashboard
2. Navigate to **Data & Backend** → **Data Collections**
3. Click **Create Collection**
4. Name it exactly: `wishlist`
5. Add these fields:
   - `contactId` (Text)
   - `productId` (Text)
   - `productName` (Text)
   - `price` (JSON Object)
   - `image` (JSON Object)
   - `quantity` (Number)
   - `catalogReference` (JSON Object)
   - `addedDate` (Date & Time)

### Step 2: Set Permissions

Make sure the collection has these permissions:
- **Read**: Anyone
- **Create**: Anyone (for authenticated users)
- **Update**: Anyone (for authenticated users)
- **Delete**: Anyone (for authenticated users)

### Step 3: Verify Environment Variables

Ensure these are set in `.env.local`:
```bash
WIX_API_KEY=your_api_key
WIX_ACCOUNT_ID=your_account_id
WIX_SITE_ID=your_site_id
```

## Testing the Setup

### Test 1: Check API Endpoint
Visit: `http://localhost:3000/api/wishlist-test`

This will test if:
- Environment variables are set
- Wix API connection works
- Wishlist collection is accessible

### Test 2: Check Browser Console
1. Open browser dev tools (F12)
2. Go to cart page
3. Click "Save for later" on any item
4. Check console for detailed error messages

### Test 3: Mock Mode
If you set `USE_MOCK_WISHLIST=true`, the wishlist will work without Wix Data setup.

## Common Issues

### Issue 1: "Missing Wix environment variables"
**Solution**: Add the environment variables to `.env.local` or enable mock mode.

### Issue 2: "Wishlist collection not accessible"
**Solution**: Create the `wishlist` collection in Wix Data with the correct field structure.

### Issue 3: "Failed to add to wishlist"
**Solution**: Check browser console for detailed error messages. Usually indicates API or collection issues.

## Quick Fix for Testing

Add this to your `.env.local`:
```bash
USE_MOCK_WISHLIST=true
```

This will enable mock mode and the wishlist will work immediately for testing purposes.

## Production Setup

For production, you'll need to:
1. Create the Wix Data collection
2. Remove the mock mode environment variable
3. Ensure proper API credentials are set
