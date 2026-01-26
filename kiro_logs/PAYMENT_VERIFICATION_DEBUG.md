# 🔍 Payment Verification - Enhanced Debugging

## 🎯 What Was Fixed

### 1. ✅ Added Signature Verification
**Problem:** Backend wasn't verifying eSewa's signature - security risk!

**Solution:** Now verifies signature using HMAC-SHA256:
```typescript
const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${merchantId},signed_field_names=...`
const expectedSignature = crypto.createHmac("sha256", secretKey).update(message).digest("base64")
```

### 2. ✅ Enhanced Logging
**Added comprehensive logging at every step:**
- ✅ Frontend: Logs eSewa response and verification request
- ✅ Backend API: Logs each verification step
- ✅ Payment Service: Logs eSewa API calls and responses

### 3. ✅ Better Error Handling
**Now provides detailed error messages:**
- Signature mismatch
- Payment status not COMPLETE
- Cart not found
- Payment session not found
- Transaction UUID mismatch

### 4. ✅ Fixed Payment Session Status Check
**Problem:** Only checked for "pending" status

**Solution:** Now checks for both "pending" and "authorized" status

### 5. ✅ Send All eSewa Data to Backend
**Frontend now sends:**
- transaction_code
- transaction_uuid
- cart_id
- total_amount
- status
- signature (for verification)

---

## 🚀 REQUIRED: Restart Backend

```bash
cd edailo
# Stop with Ctrl+C
npm run dev
```

**CRITICAL:** Backend must be restarted for changes to take effect!

---

## 🧪 Testing with Enhanced Logging

### Step 1: Open Browser Console
```
F12 → Console tab
```

### Step 2: Open Backend Terminal
```
Watch for logs starting with:
=== eSewa Verification Request ===
```

### Step 3: Complete Payment
1. Add product to cart
2. Go to checkout
3. Select eSewa
4. Complete payment (9806800001 / Nepal@123 / 1122)

### Step 4: Watch the Logs

#### Frontend Console Should Show:
```javascript
eSewa Response: {
  transaction_code: "000DY...",
  status: "COMPLETE",
  total_amount: "30.0",
  transaction_uuid: "cart-...",
  signature: "..."
}

Verifying payment with backend...
- Cart ID: cart_...
- Transaction UUID: cart-...
- Transaction Code: 000DY...
- Status: COMPLETE
- Total Amount: 30.0

Verification result: { success: true, payment: {...} }
Payment verified successfully, completing order...
Order completion response: { type: "order", order: {...} }
✅ Order created successfully: order_...
```

#### Backend Terminal Should Show:
```
=== eSewa Verification Request ===
Cart ID: cart_...
Transaction UUID: cart-...
Transaction Code: 000DY...
Status: COMPLETE
Total Amount: 30.0

Signature verification:
- Expected: lnxO3BWS2D5aKY4bMfngZ8OxNkxGId4qqJ2lBitq4X8=
- Received: lnxO3BWS2D5aKY4bMfngZ8OxNkxGId4qqJ2lBitq4X8=
- Match: true
✅ Signature verified successfully

✅ Payment status is COMPLETE

Fetching cart from database...
✅ Cart found: cart_...
✅ Payment collection found: paycol_...
✅ Payment session found: { id: 'ps_...', status: 'pending', amount: 30 }
✅ Transaction UUID matches

Authorizing payment session...

=== eSewa authorizePayment called ===
Payment session data: {...}
Context: { transaction_code: '000DY...', transaction_uuid: 'cart-...' }

Verifying payment with eSewa API...
- Transaction Code: 000DY...
- Transaction UUID: cart-...
- Total Amount: 30.0

=== Calling eSewa Verification API ===
URL: https://rc-epay.esewa.com.np/api/epay/transaction/status?product_code=EPAYTEST&total_amount=30.0&transaction_uuid=cart-...
Parameters: { product_code: 'EPAYTEST', total_amount: '30.0', transaction_uuid: 'cart-...' }

eSewa API Response Status: 200
eSewa API Response Data: { status: 'COMPLETE', transaction_uuid: 'cart-...', ... }
✅ eSewa verification successful

✅ Payment verified successfully with eSewa
✅ Payment authorized successfully: ps_...
=== Verification Complete ===
```

---

## 🐛 Debugging Specific Errors

### Error: "Invalid signature"

**Cause:** Signature from eSewa doesn't match expected signature

**Debug:**
```
Check backend logs for:
Signature verification:
- Expected: [hash]
- Received: [hash]
- Match: false
```

**Solutions:**
1. Verify ESEWA_SECRET_KEY in .env matches eSewa dashboard
2. Check if signature message format is correct
3. Ensure no extra spaces or characters in secret key

---

### Error: "Cart not found"

**Cause:** Cart ID from localStorage doesn't exist in database

**Debug:**
```javascript
// In browser console
console.log(localStorage.getItem("cart_id"))
```

**Solutions:**
1. Clear localStorage and create new cart
2. Check if cart was deleted
3. Verify cart ID format (should be: cart_...)

---

### Error: "eSewa payment session not found"

**Cause:** No eSewa payment session found for the cart

**Debug:**
```
Check backend logs for:
Available sessions: [{ provider_id: '...', status: '...' }]
```

**Solutions:**
1. Verify payment session was created during checkout
2. Check provider_id is "pp_esewa_esewa"
3. Check session status (should be "pending" or "authorized")

---

### Error: "Transaction UUID mismatch"

**Cause:** Transaction UUID from eSewa doesn't match payment session

**Debug:**
```
Check backend logs for:
- Session UUID: cart-...
- eSewa UUID: cart-...
```

**Solutions:**
1. Verify transaction_uuid is being stored correctly in payment session
2. Check if eSewa is returning the correct UUID
3. Ensure no UUID modification during payment flow

---

### Error: "Payment verification failed with eSewa"

**Cause:** eSewa API verification failed

**Debug:**
```
Check backend logs for:
=== Calling eSewa Verification API ===
eSewa API Response Status: [status]
eSewa API Response Data: {...}
```

**Solutions:**
1. Check eSewa API is accessible
2. Verify transaction exists in eSewa system
3. Check total_amount matches exactly
4. Ensure transaction_uuid is correct

---

## 📊 Verification Flow (Step by Step)

```
1. User completes payment on eSewa
   ↓
2. eSewa redirects to: /dk/order?data=base64_response
   ↓
3. Frontend decodes eSewa response
   Console: "eSewa Response: {...}"
   ↓
4. Frontend sends POST to /esewa/verify with ALL data
   Console: "Verifying payment with backend..."
   ↓
5. Backend receives request
   Log: "=== eSewa Verification Request ==="
   ↓
6. Backend verifies signature
   Log: "Signature verification: Match: true"
   ↓
7. Backend checks payment status
   Log: "✅ Payment status is COMPLETE"
   ↓
8. Backend fetches cart from database
   Log: "✅ Cart found: cart_..."
   ↓
9. Backend finds payment session
   Log: "✅ Payment session found: {...}"
   ↓
10. Backend verifies transaction UUID
    Log: "✅ Transaction UUID matches"
   ↓
11. Backend calls authorizePaymentSession
    Log: "Authorizing payment session..."
   ↓
12. Payment service calls eSewa API
    Log: "=== Calling eSewa Verification API ==="
   ↓
13. eSewa API responds
    Log: "eSewa API Response Status: 200"
   ↓
14. Payment service verifies response
    Log: "✅ eSewa verification successful"
   ↓
15. Payment authorized
    Log: "✅ Payment authorized successfully"
   ↓
16. Backend responds to frontend
    Response: { success: true, payment: {...} }
   ↓
17. Frontend completes order
    Console: "Payment verified successfully, completing order..."
   ↓
18. Order created
    Console: "✅ Order created successfully: order_..."
   ↓
19. Redirect to confirmation
    URL: /dk/order/{order_id}/confirmed
```

---

## ✅ Success Indicators

### Frontend Console
```javascript
✅ eSewa Response received
✅ Status is COMPLETE
✅ Cart ID found in localStorage
✅ Verification request sent
✅ Verification result: success: true
✅ Order created successfully
✅ Redirecting to confirmation
```

### Backend Logs
```
✅ Signature verified successfully
✅ Payment status is COMPLETE
✅ Cart found
✅ Payment collection found
✅ Payment session found
✅ Transaction UUID matches
✅ eSewa verification successful
✅ Payment authorized successfully
✅ Verification Complete
```

---

## 🔐 Security Checks

### 1. Signature Verification
```
✅ Verifies eSewa signature using HMAC-SHA256
✅ Prevents tampering with payment data
✅ Ensures request came from eSewa
```

### 2. Transaction UUID Verification
```
✅ Matches UUID from eSewa with payment session
✅ Prevents replay attacks
✅ Ensures payment is for correct cart
```

### 3. eSewa API Verification
```
✅ Double-checks with eSewa's API
✅ Verifies payment status is COMPLETE
✅ Confirms transaction exists in eSewa system
```

---

## 📝 Files Modified

1. ✅ `edailo/src/api/esewa/verify/route.ts`
   - Added signature verification
   - Enhanced logging
   - Better error handling
   - Check both pending and authorized status

2. ✅ `edailo/src/modules/esewa-payment/service.ts`
   - Enhanced authorizePayment logging
   - Improved verifyPayment error handling
   - Better eSewa API error messages

3. ✅ `edailo-storefront/src/app/[countryCode]/(main)/order/page.tsx`
   - Send all eSewa data to backend
   - Enhanced logging
   - Better error messages

---

## 🎯 Next Steps

1. **Restart backend** (REQUIRED!)
2. **Test payment flow**
3. **Watch both consoles** (browser + backend)
4. **Verify all checkmarks appear** (✅)
5. **Check order is created**

---

## 📞 If Verification Still Fails

**Check these in order:**

1. **Backend restarted?**
   ```bash
   cd edailo && npm run dev
   ```

2. **Environment variables correct?**
   ```bash
   # Check .env file
   ESEWA_MERCHANT_ID=EPAYTEST
   ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
   ```

3. **Backend logs show errors?**
   ```
   Look for ❌ symbols in logs
   ```

4. **Frontend console shows errors?**
   ```
   Check for red error messages
   ```

5. **eSewa response valid?**
   ```javascript
   // Should have all fields
   { transaction_code, status, total_amount, transaction_uuid, signature }
   ```

---

**RESTART BACKEND AND TEST WITH LOGGING!** 🚀

You'll now see exactly where the verification fails (if it does).
