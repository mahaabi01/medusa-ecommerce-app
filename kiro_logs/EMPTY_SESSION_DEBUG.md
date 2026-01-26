# 🔍 Empty Payment Session Debug

## 🔴 Problem

Payment session data is empty (all fields are `undefined`):
```javascript
Amount: undefined
Total Amount: undefined
Transaction UUID: undefined
Product Code: undefined
```

This means the backend's `initiatePayment` method either:
1. Wasn't called at all
2. Was called but failed
3. Was called but returned empty data

---

## 🔍 Step 1: Check Backend Logs

### What to Look For:

**When you select eSewa at checkout, you should see:**
```
=== eSewa initiatePayment ===
Amount: 90
Currency: npr
Resource ID: cart_01KFW75YPKGW627519R1MJ8ZNK
```

### If You DON'T See This:

**Possible causes:**
1. Backend not restarted after code changes
2. Payment provider not loaded
3. Wrong provider ID selected

### If You DO See This But Still Get Empty Data:

**Check for errors after the log:**
```
❌ eSewa initiate payment error: [error message]
```

---

## 🔍 Step 2: Check Payment Provider Registration

### In Backend Terminal at Startup:

**Should see:**
```
✓ Payment providers loaded
✓ esewa provider registered
```

### If You Don't See This:

**Check medusa-config.ts:**
```typescript
modules: [
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "./src/modules/esewa-payment",
          id: "esewa",
          options: {
            merchantId: process.env.ESEWA_MERCHANT_ID,
            secretKey: process.env.ESEWA_SECRET_KEY,
            environment: process.env.ESEWA_ENVIRONMENT || "test",
          },
        },
      ],
    },
  },
]
```

---

## 🔍 Step 3: Check Environment Variables

### In Backend Terminal:

```bash
# Check .env file
cat edailo/.env | grep ESEWA
```

**Should show:**
```
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_ENVIRONMENT=test
STOREFRONT_URL=http://localhost:8000
```

### If Missing or Wrong:

**Update .env file:**
```bash
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_ENVIRONMENT=test
STOREFRONT_URL=http://localhost:8000
```

**Then restart backend:**
```bash
cd edailo
npm run dev
```

---

## 🔍 Step 4: Check Payment Session Creation

### In Browser Console:

```javascript
// After selecting eSewa payment method
// Check the payment session
const cartId = localStorage.getItem("cart_id")
const response = await fetch(`http://localhost:9000/store/carts/${cartId}`)
const data = await response.json()
console.log("Payment sessions:", data.cart.payment_collection.payment_sessions)
```

**Should show:**
```javascript
[{
  id: "ps_...",
  provider_id: "pp_esewa_esewa",
  status: "pending",
  amount: 90,
  data: {
    amount: "90",
    total_amount: "90",
    transaction_uuid: "cart_...-...",
    product_code: "EPAYTEST",
    signature: "...",
    payment_url: "https://rc-epay.esewa.com.np/...",
    // ... more fields
  }
}]
```

### If `data` is Empty `{}`:

**This confirms initiatePayment failed or wasn't called**

---

## 🔍 Step 5: Manual Test of initiatePayment

### Check if the service file has syntax errors:

```bash
cd edailo
npm run build
```

**Look for errors in:**
```
src/modules/esewa-payment/service.ts
```

### Common Issues:

1. **Missing return statement** in initiatePayment
2. **Syntax error** preventing method execution
3. **Exception thrown** before return
4. **Wrong method signature**

---

## ✅ Solution Steps

### 1. Verify Backend is Running
```bash
cd edailo
# Should see: Server is ready on port 9000
```

### 2. Check Backend Logs for Errors
```bash
# Look for any red error messages
# Especially around payment provider loading
```

### 3. Restart Backend with Clean Build
```bash
cd edailo
# Stop with Ctrl+C
rm -rf .medusa/server/dist  # Clear build cache
npm run dev
```

### 4. Check Environment Variables
```bash
cat .env | grep ESEWA
# Verify all 4 variables are set
```

### 5. Test Payment Session Creation
```javascript
// In browser console at checkout
// After selecting eSewa
const cartId = localStorage.getItem("cart_id")
fetch(`http://localhost:9000/store/carts/${cartId}`)
  .then(r => r.json())
  .then(d => console.log("Session data:", d.cart.payment_collection.payment_sessions[0].data))
```

---

## 🎯 Expected vs Actual

### Expected (Working):
```
Backend logs:
=== eSewa initiatePayment ===
Amount: 90
✅ Payment data created

Browser console:
=== Payment Session Debug ===
Session data: {
  amount: "90",
  total_amount: "90",
  transaction_uuid: "cart_...",
  product_code: "EPAYTEST",
  signature: "...",
  ...
}
```

### Actual (Broken):
```
Backend logs:
[No logs about eSewa initiatePayment]

Browser console:
=== Payment Session Debug ===
Session data: {}
Amount: undefined
Total Amount: undefined
```

---

## 🚨 Most Likely Causes

### 1. Backend Not Restarted
**Solution:** Restart backend completely
```bash
cd edailo
# Ctrl+C to stop
npm run dev
```

### 2. Environment Variables Missing
**Solution:** Check and update .env file
```bash
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
```

### 3. Payment Provider Not Loaded
**Solution:** Check medusa-config.ts has correct module configuration

### 4. Build Cache Issue
**Solution:** Clear build cache and restart
```bash
rm -rf .medusa/server/dist
npm run dev
```

### 5. Code Syntax Error
**Solution:** Check for TypeScript errors
```bash
npm run build
```

---

## 📞 Next Steps

1. **Check backend terminal** - Look for "=== eSewa initiatePayment ===" when you select eSewa
2. **If you see the log** - Check for errors after it
3. **If you DON'T see the log** - Payment provider not loaded or not called
4. **Share backend logs** - Copy the entire backend terminal output

---

**Check backend logs and share what you see!** 🔍
