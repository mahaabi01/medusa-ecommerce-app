# 🚀 Restart and Test - Quick Guide

## ⚠️ Current Issue

**Error:** `Missing required fields: amount, total_amount, transaction_uuid, product_code, signature`

**Cause:** Backend wasn't restarted after changes, so payment session has old/empty data

---

## ✅ Solution: Restart Backend

### Step 1: Stop Backend
```bash
# In backend terminal, press:
Ctrl + C
```

### Step 2: Start Backend
```bash
cd edailo
npm run dev
```

**Wait for:** `Server is ready on port 9000`

---

## 🧪 Test Payment Flow

### Step 1: Clear Browser Data
```javascript
// Open browser console (F12)
localStorage.clear()
// Then refresh page
```

### Step 2: Create New Cart
1. Go to: http://localhost:8000/dk/store
2. Add product to cart
3. Go to checkout

### Step 3: Check Payment Session
```javascript
// In browser console, before clicking "Pay with eSewa"
// This will show if payment session has data
console.log("Checking payment session...")
```

### Step 4: Click "Pay with eSewa"

**Should see in console:**
```javascript
=== eSewa Payment Submission ===
✅ Stored cart ID in localStorage: cart_01JJ...
Cart ID: cart_01JJ...
Amount: 90
Total Amount: 90
Transaction UUID: cart_01JJ...-1769414219573
Product Code: EPAYTEST
```

**Should NOT see:**
```
❌ Missing required fields: [...]
```

---

## 🐛 If Still Getting Error

### Check 1: Backend Logs
```
Look for:
=== eSewa initiatePayment ===
Amount: 90
Currency: npr
Resource ID: cart_01JJ...
```

**If you don't see this**, payment session wasn't created.

### Check 2: Payment Session Data
```javascript
// In browser console at checkout
const cart = await fetch('http://localhost:9000/store/carts/YOUR_CART_ID')
  .then(r => r.json())
console.log(cart.payment_collection.payment_sessions)
```

**Should show:**
```javascript
[{
  provider_id: "pp_esewa_esewa",
  status: "pending",
  data: {
    amount: "90",
    total_amount: "90",
    transaction_uuid: "cart_...",
    product_code: "EPAYTEST",
    signature: "...",
    // ... more fields
  }
}]
```

### Check 3: Environment Variables
```bash
# Check .env file has:
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_ENVIRONMENT=test
STOREFRONT_URL=http://localhost:8000
```

---

## 📊 Expected Flow

```
1. Backend starts
   ✅ eSewa payment provider loaded
   ↓
2. User adds product to cart
   ✅ Cart created: cart_01JJ...
   ↓
3. User goes to checkout
   ✅ Payment session created
   ↓
4. Backend logs:
   === eSewa initiatePayment ===
   Amount: 90
   ✅ Payment data created
   ↓
5. User clicks "Pay with eSewa"
   ✅ All fields present
   ✅ Form submitted to eSewa
   ↓
6. User completes payment
   ✅ Redirects back
   ✅ Verification succeeds
   ✅ Order created
```

---

## 🎯 Quick Checklist

- [ ] Backend restarted
- [ ] Backend shows "Server is ready"
- [ ] Browser localStorage cleared
- [ ] New cart created
- [ ] Payment session has data
- [ ] "Pay with eSewa" button works

---

**RESTART BACKEND NOW!** 🚀

Then create a fresh cart and test.
