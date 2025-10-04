# Debug Customer Website - Active Products Issue

## Problem
Customer website (http://localhost:3000/shop) still shows Draft/Inactive products even though API is working correctly.

## Root Cause Analysis

### ✅ What's Working:
- Admin API: http://localhost:3002/api/public/products returns only Active products
- API filter: `status: 'Active'` is working correctly
- API response: All products have `"status": "Active"`

### ❌ What's Not Working:
- Customer website still shows Draft/Inactive products
- This suggests a caching or connectivity issue

## Debug Steps

### Step 1: Check Customer Website API Call
1. Open customer website: http://localhost:3000/shop
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API call to: `http://localhost:3002/api/public/products`
6. Click on the API call
7. Check Response tab - should only show Active products

### Step 2: Check API_BASE_URL
Verify customer website is calling the correct API:
- Should call: `http://localhost:3002/api/public/products`
- NOT: `http://localhost:3000/api/public/products`

### Step 3: Clear All Caches
1. **Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Select "Cached images and files"
   - Click "Clear data"

2. **Next.js Cache:**
   ```bash
   # Stop customer website (Ctrl+C)
   cd furniro-cust
   rm -rf .next
   npm run dev
   ```

3. **Admin Server Cache:**
   ```bash
   # Stop admin server (Ctrl+C)
   cd furniro-ad
   rm -rf .next
   npm run dev
   ```

### Step 4: Verify Servers Are Running
1. **Admin Server:** http://localhost:3002
2. **Customer Website:** http://localhost:3000

### Step 5: Test API Directly
Open browser and test:
```
http://localhost:3002/api/public/products?limit=5
```

Should return only Active products.

### Step 6: Test Customer Website
1. Go to: http://localhost:3000/shop
2. Should only show Active products
3. Draft/Inactive products should not appear

## Common Issues & Solutions

### Issue 1: Browser Cache
**Solution:** Clear browser cache and hard refresh (Ctrl+F5)

### Issue 2: Next.js Cache
**Solution:** Delete .next folder and restart

### Issue 3: Wrong API URL
**Solution:** Check if customer website is calling correct API

### Issue 4: Network Issues
**Solution:** Check if admin server is running on port 3002

### Issue 5: CORS Issues
**Solution:** Check browser console for CORS errors

## Quick Fix Commands

```bash
# Stop all servers
# Press Ctrl+C in both terminals

# Restart admin server
cd furniro-ad
rm -rf .next
npm run dev

# Restart customer website (new terminal)
cd furniro-cust
rm -rf .next
npm run dev
```

## Verification Checklist

- [ ] Admin server running on port 3002
- [ ] Customer website running on port 3000
- [ ] API returns only Active products
- [ ] Customer website calls correct API
- [ ] No browser cache issues
- [ ] No Next.js cache issues
- [ ] Customer website shows only Active products

## Expected Result

After following these steps:
- Customer website should only show Active products
- Draft/Inactive products should not appear
- API calls should go to correct endpoint
- No caching issues

## If Still Not Working

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify admin server is accessible
4. Check if there are multiple versions of the code running
