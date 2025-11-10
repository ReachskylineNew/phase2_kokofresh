# Wishlist Functionality Test Guide

## Overview
The "Save for Later" functionality has been implemented with account-level persistence. Here's how to test it:

## Features Implemented

### 1. Save for Later in Cart
- Users can click "Save for later" button on any cart item
- Item is moved from cart to wishlist
- Requires user authentication (shows error if not logged in)
- Success toast notification appears

### 2. Wishlist Page (`/wishlist`)
- Shows all saved items with same UI as cart page
- Displays item details, quantity, price, and save date
- Options to remove items or move back to cart
- Shows total value of all saved items
- Redirects to login page if user not authenticated

### 3. Navigation Integration
- Heart icon in navigation shows wishlist count
- Mobile menu includes wishlist link with count
- Badge shows number of saved items

### 4. Account-Level Persistence
- Items are saved to Wix Data collection "wishlist"
- Linked to user's contact ID
- Persists across devices and sessions
- Items remain after logout/login

## Testing Steps

### Prerequisites
1. User must be logged in (create account via `/profile`)
2. Add items to cart from shop page

### Test Scenarios

#### Scenario 1: Save Item from Cart
1. Go to `/cart` page
2. Click "Save for later" on any item
3. Verify item disappears from cart
4. Check navigation heart icon shows count
5. Go to `/wishlist` page and verify item appears

#### Scenario 2: Move Item Back to Cart
1. Go to `/wishlist` page
2. Click "Move to cart" on any item
3. Verify item disappears from wishlist
4. Go to `/cart` page and verify item appears

#### Scenario 3: Account Persistence
1. Save items to wishlist
2. Log out from `/profile`
3. Log back in
4. Go to `/wishlist` - items should still be there

#### Scenario 4: Remove from Wishlist
1. Go to `/wishlist` page
2. Click "Remove" on any item
3. Verify item disappears from list
4. Check navigation count updates

## API Endpoints

### GET `/api/wishlist?contactId={id}`
- Fetches all wishlist items for a user
- Returns array of wishlist items

### POST `/api/wishlist`
- Adds item to wishlist
- Requires: contactId, productId, productName, price, image, quantity, catalogReference
- Returns success status and created item

### DELETE `/api/wishlist`
- Removes item from wishlist
- Requires: contactId, itemId
- Returns success status

## Data Structure

Wishlist items are stored in Wix Data collection "wishlist" with:
```json
{
  "contactId": "user-contact-id",
  "productId": "product-id",
  "productName": "Product Name",
  "price": {
    "amount": "299.00",
    "formattedAmount": "₹299.00"
  },
  "image": {
    "url": "/path/to/image"
  },
  "quantity": 1,
  "catalogReference": {
    "appId": "215238eb-22a5-4c36-9e7b-e7c08025e04e",
    "catalogItemId": "product-id"
  },
  "addedDate": "2024-01-01T00:00:00.000Z"
}
```

## Mock Mode
Set `USE_MOCK_WISHLIST=true` in environment variables to test without Wix API setup.

## Error Handling
- Shows toast notifications for success/error states
- Handles authentication errors gracefully
- Prevents duplicate items in wishlist
- Validates user ownership before operations
