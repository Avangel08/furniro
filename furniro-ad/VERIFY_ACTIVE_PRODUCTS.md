# Verification: Active Products Logic

## Current Issue
Customer website is showing products with status other than "Active" (e.g., Draft, Inactive)

## Expected Behavior
- Customer website should ONLY show products with status = "Active"
- Admin dashboard can see ALL products (Active, Draft, Inactive)

## Verification Steps

### Step 1: Check Database Products
Run this MongoDB command in your database:
```javascript
db.products.find({}, {name: 1, status: 1, _id: 1}).pretty()
```

Expected: You should see products with different statuses (Active, Draft, Inactive)

### Step 2: Test Public API
Open browser and go to:
```
http://localhost:3002/api/public/products?limit=10
```

Expected: Should ONLY return products with "status": "Active"

If you see products with "status": "Draft" or "Inactive", the API filter is broken.

### Step 3: Test Customer Website
1. Open: http://localhost:3000/shop
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API call to: `http://localhost:3002/api/public/products`
6. Check the response - should only show Active products

### Step 4: Verify API Code
Check file: `furniro-ad/src/app/api/public/products/route.ts`

Line 18-20 should have:
```typescript
const filter: any = {
  status: 'Active' // Only show active products to customers (case-sensitive)
};
```

## Possible Issues

### Issue 1: Case Sensitivity
Product.status in database might be stored as lowercase "active" instead of "Active"

Solution: Update database products to use "Active" with capital A

### Issue 2: API Not Working
The filter might not be applied correctly

Solution: Check if the API code has the filter

### Issue 3: Caching
Old data might be cached

Solution: 
- Clear browser cache
- Restart admin server
- Restart customer website

### Issue 4: Wrong API Endpoint
Customer website might be calling admin API instead of public API

Solution: Check if customer website is using `/api/public/products` (correct) not `/api/products` (wrong)

## Quick Fix

### Fix 1: Update All Products to Active
```javascript
// Run in MongoDB
db.products.updateMany({}, {$set: {status: "Active"}})
```

### Fix 2: Restart Servers
```bash
# Stop all servers
# Restart admin server
cd furniro-ad
npm run dev

# Restart customer website (in new terminal)
cd furniro-cust
npm run dev
```

### Fix 3: Clear Browser Cache
1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

## Test After Fix

### Test 1: Check API Response
```
http://localhost:3002/api/public/products?limit=5
```

All products should have "status": "Active"

### Test 2: Check Customer Website
```
http://localhost:3000/shop
```

Should only show Active products

### Test 3: Test Inactive Product
1. Go to admin dashboard
2. Change a product status to "Inactive"
3. Save
4. Go to customer website
5. Product should disappear from shop page

### Test 4: Test Draft Product
1. Go to admin dashboard
2. Change a product status to "Draft"
3. Save
4. Go to customer website
5. Product should disappear from shop page

## Verification Checklist

- [ ] Database has products with different statuses
- [ ] Public API only returns Active products
- [ ] Customer website only shows Active products
- [ ] Admin dashboard shows all products
- [ ] Changing status to Inactive hides product from customer
- [ ] Changing status to Draft hides product from customer
- [ ] Changing status to Active shows product to customer

## Summary

The logic is implemented correctly in code, but there might be:
1. Case sensitivity issues (active vs Active)
2. Caching issues
3. Old data in database
4. Need to restart servers

Follow the steps above to identify and fix the issue.
