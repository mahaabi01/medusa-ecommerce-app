# eSewa Payment Error - Debugging Guide

## 🔍 Current Issue

**Error:** Payment unsuccessful on eSewa gateway  
**Status:** 400 Bad Request  
**URL:** `https://rc-epay.esewa.com.np/api/epay/client/makePayment`

## 🎯 Root Causes & Solutions

### Issue 1: Amount Format

**Problem:** eSewa expects amounts in NPR (Nepali Rupees), not paisa.

**Solution Applied:**
- ✅ Updated service to divide amount by 100
- ✅ Format: `(amount / 100).toFixed(2)`
- ✅ Example: 10000 cents → "100.00" NPR

### Issue 2: Failure URL Redirect

**Problem:** Failure URL redirects to non-existent page

**Solution Applied:**
- ✅ Created payment failure page: `/[countryCode]/payment-failed`
- ✅ Updated failure URL to include country code
- ✅ Shows user-friendly error message with retry option

### Issue 3: Missing Validation

**Problem:** No validation of payment data before submission

**Solution Applied:**
- ✅ Added field validation in payment button
- ✅ Added console logging for debugging
- ✅ Shows error if required fields missing

---

## 🧪 Testing Steps

### Step 1: Check Payment Data in Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Proceed to checkout and click "Pay with eSewa"
4. Look for log: "eSewa Payment Data:"

**Expected Output:**
```javascript
{
  amount: "100.00",
  total_amount: "100.00",
  transaction_uuid: "cart_xxx-1234567890",
  product_code: "EPAYTEST",
  signature: "base64_encoded_signature",
  payment_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
}
```

### Step 2: Verify Amount Calculation

**Check in backend logs:**
```bash
cd edailo
npm run dev
# Look for: "eSewa payment initiated"
```

**Should show:**
```
eSewa payment initiated: {
  transaction_uuid: "cart_xxx-1234567890",
  amount: "100.00",  // ← Should be in rupees, not paisa
  cart_id: "cart_xxx"
}
```

### Step 3: Test with Specific Amount

Try with a **small, round amount** first:
- Cart total: NPR 100 (10000 cents in Medusa)
- eSewa should receive: "100.00"

### Step 4: Verify Signature

The signature must match eSewa's format exactly:

**Format:**
```
total_amount=100.00,transaction_uuid=cart_xxx-123,product_code=EPAYTEST
```

**Hashed with:** HMAC-SHA256 using secret key  
**Encoded as:** Base64

---

## 🔧 Common Issues & Fixes

### Issue: "Invalid Signature"

**Cause:** Signature format doesn't match eSewa requirements

**Check:**
1. Secret key is correct: `8gBm/:&EnhH.1/q`
2. Merchant code is correct: `EPAYTEST`
3. Amount format is correct: "100.00" (not "100" or "10000")

**Debug:**
```javascript
// In browser console, check:
console.log(session.data.signature)
// Should be a base64 string like: "abc123xyz=="
```

---

### Issue: "Invalid Amount"

**Cause:** Amount format is incorrect

**Check:**
1. Amount should be in rupees (NPR), not paisa
2. Format: "100.00" with 2 decimal places
3. Must be a string, not a number

**Fix:**
- ✅ Already applied in service.ts
- Amount is divided by 100 and formatted with 2 decimals

---

### Issue: "Invalid Product Code"

**Cause:** Merchant ID doesn't match

**Check:**
```bash
cd edailo
cat .env | grep ESEWA_MERCHANT_ID
# Should show: ESEWA_MERCHANT_ID=EPAYTEST
```

**Verify in payment data:**
```javascript
// Should be:
product_code: "EPAYTEST"
```

---

### Issue: Payment Fails but No Error Message

**Cause:** Failure URL not working

**Solution Applied:**
- ✅ Created `/[countryCode]/payment-failed` page
- ✅ Updated failure URL to include country code
- ✅ User can retry or return to cart

---

## 🎯 Manual Testing Checklist

### Backend Verification

- [ ] Backend running without errors
- [ ] Environment variables loaded:
  ```bash
  ESEWA_MERCHANT_ID=EPAYTEST
  ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
  ESEWA_ENVIRONMENT=test
  STOREFRONT_URL=http://localhost:8000
  ```
- [ ] Payment provider registered (check logs)
- [ ] eSewa enabled in region

### Payment Session Verification

- [ ] Payment session created when eSewa selected
- [ ] Session data includes all required fields
- [ ] Amount is in correct format (rupees, 2 decimals)
- [ ] Signature is generated correctly
- [ ] URLs are absolute and correct

### Form Submission Verification

- [ ] Form created with all fields
- [ ] No missing required fields
- [ ] Form submits to correct eSewa URL
- [ ] Browser redirects to eSewa gateway

### eSewa Gateway Verification

- [ ] eSewa page loads correctly
- [ ] Payment details display correctly
- [ ] Amount shows in NPR (not paisa)
- [ ] Can login with test credentials
- [ ] Can complete payment

### Redirect Verification

- [ ] Success: Redirects to `/order?transaction_uuid=xxx&cart_id=yyy`
- [ ] Failure: Redirects to `/[countryCode]/payment-failed?error=payment_failed`
- [ ] Both URLs are accessible

---

## 🐛 Debug Commands

### Check Payment Session Data

```bash
# In browser console after selecting eSewa:
localStorage.getItem('cart_id')
# Should return cart ID

# Check payment session in Network tab:
# Look for: POST /store/payment-collections/:id/payment-sessions
# Response should include eSewa session data
```

### Check Backend Logs

```bash
cd edailo
npm run dev

# Look for:
# ✓ "eSewa payment initiated"
# ✓ Transaction UUID
# ✓ Amount in rupees
```

### Test Signature Generation

Create a test script to verify signature:

```javascript
// test-signature.js
const crypto = require('crypto')

const data = {
  total_amount: "100.00",
  transaction_uuid: "test-123",
  product_code: "EPAYTEST"
}

const message = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`
const secretKey = "8gBm/:&EnhH.1/q"

const signature = crypto
  .createHmac('sha256', secretKey)
  .update(message)
  .digest('base64')

console.log('Message:', message)
console.log('Signature:', signature)
```

Run: `node test-signature.js`

---

## 🎯 Expected vs Actual

### Expected Payment Data

```json
{
  "amount": "100.00",
  "tax_amount": "0",
  "total_amount": "100.00",
  "transaction_uuid": "cart_01JQXXX-1234567890",
  "product_code": "EPAYTEST",
  "product_service_charge": "0",
  "product_delivery_charge": "0",
  "success_url": "http://localhost:8000/order?transaction_uuid=cart_01JQXXX-1234567890&cart_id=cart_01JQXXX",
  "failure_url": "http://localhost:8000/us/payment-failed?error=payment_failed",
  "signature": "base64_encoded_string"
}
```

### Check Your Actual Data

1. Open browser console
2. Click "Pay with eSewa"
3. Look for "eSewa Payment Data:" log
4. Compare with expected format above

---

## 🚀 Quick Fix Steps

### If Amount is Wrong

```bash
# Restart backend after changes
cd edailo
npm run dev
```

### If Signature is Wrong

Check secret key:
```bash
cd edailo
cat .env | grep ESEWA_SECRET_KEY
# Must be exactly: 8gBm/:&EnhH.1/q
```

### If URLs are Wrong

Check storefront URL:
```bash
cd edailo
cat .env | grep STOREFRONT_URL
# Must be: http://localhost:8000
```

### If Payment Still Fails

1. Check eSewa test environment status
2. Try with different amount (e.g., NPR 10, 50, 100)
3. Verify test merchant credentials are active
4. Check eSewa developer documentation for updates

---

## 📞 eSewa Support

If issue persists:

1. **Check eSewa Status:** https://esewa.com.np
2. **Developer Docs:** https://developer.esewa.com.np
3. **Test Environment:** Ensure test mode is working
4. **Merchant Account:** Verify EPAYTEST is active

---

## ✅ Success Indicators

Payment is working correctly when:

1. ✅ Console shows correct payment data
2. ✅ eSewa page loads without errors
3. ✅ Amount displays correctly on eSewa
4. ✅ Can complete test payment
5. ✅ Redirects back to store
6. ✅ Order is created successfully

---

## 🎉 After Fixing

Once payment works:

1. Test with different amounts
2. Test failure scenario (cancel payment)
3. Test success scenario (complete payment)
4. Verify order creation
5. Check order in Medusa Admin

---

**Current Status:** Fixes applied, ready for testing with debugging enabled.
