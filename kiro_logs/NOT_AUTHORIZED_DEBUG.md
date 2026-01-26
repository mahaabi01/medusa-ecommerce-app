# 🔍 "Session was not authorized" Debug

## 🔴 Error

`Session: payses_01KFWP39N1PRGT5G8QJQ628PTZ was not authorized with the provider.`

This error occurs when calling `cart.complete()` - Medusa checks if the payment session is authorized before creating the order.

---

## 🔍 What This Means

1. ✅ Payment verification succeeded
2. ✅ `authorizePaymentSession` was called
3. ❌ Payment session status is NOT "authorized" in database
4. ❌ `cart.complete()` fails because payment not authorized

---

## 🔍 Check Backend Logs

### After clicking "Pay with eSewa" and completing payment:

**Look for these logs:**

```
=== eSewa Verification Request ===
✅ Signature verified successfully
✅ Payment status is COMPLETE
✅ Cart found
✅ Payment session found
✅ Transaction UUID matches

Authorizing payment session...

=== eSewa authorizePayment called ===
Payment session data: {...}
Context: { transaction_code: '...', transaction_uuid: '...' }

Verifying payment with eSewa API...
=== Calling eSewa Verification API ===
URL: https://rc-epay.esewa.com.np/api/epay/transaction/status?...
eSewa API Response Status: 200
eSewa API Response Data: { status: 'COMPLETE', ... }
✅ eSewa verification successful

✅ Payment verified successfully with eSewa
Returning authorization data:
- Status: authorized  <-- CHECK THIS VALUE
- Data status: COMPLETE

✅ Payment authorized successfully
Authorized payment status: authorized  <-- CHECK THIS VALUE
```

---

## 🎯 Key Things to Check

### 1. Authorization Status Value

**In backend logs, check:**
```
Authorized payment status: ???
```

**Should be:** `"authorized"` (lowercase string)
**NOT:** `"AUTHORIZED"`, `"pending"`, `undefined`, or anything else

### 2. eSewa API Verification

**Check if eSewa API call succeeds:**
```
=== Calling eSewa Verification API ===
eSewa API Response Status: 200
eSewa API Response Data: { status: 'COMPLETE', ... }
✅ eSewa verification successful
```

**If this fails:**
- eSewa API might be down
- Transaction UUID might not match
- Total amount might not match

### 3. Payment Session Status in Database

**After authorization, check database:**
```bash
psql -d medusa-edailo

SELECT id, status, data 
FROM payment_session 
WHERE id = 'payses_01KFWP39N1PRGT5G8QJQ628PTZ';
```

**Should show:**
```
id                          | status     | data
----------------------------|------------|------
payses_01KFWP39N1PRGT5G8... | authorized | {...}
```

**If status is NOT "authorized":**
- Authorization didn't complete
- Database update failed
- Wrong status value returned

---

## 🔧 Possible Causes

### Cause 1: eSewa API Verification Fails

**Symptoms:**
```
❌ eSewa verification failed
Status: [not COMPLETE]
```

**Solution:**
- Check transaction exists in eSewa
- Verify transaction_uuid matches
- Verify total_amount matches

### Cause 2: Wrong Status Value Returned

**Symptoms:**
```
Authorized payment status: AUTHORIZED  (uppercase)
or
Authorized payment status: undefined
```

**Solution:**
- Check `PaymentSessionStatus.AUTHORIZED` value
- Should be lowercase "authorized"

### Cause 3: Authorization Throws Error

**Symptoms:**
```
❌ Authorization failed: [error message]
```

**Solution:**
- Check error message
- Fix the underlying issue

### Cause 4: Database Update Fails

**Symptoms:**
- Logs show success
- But database still shows "pending"

**Solution:**
- Check database connection
- Check for transaction rollback
- Check Medusa logs for database errors

---

## ✅ Expected Flow

```
1. User completes payment on eSewa
   ↓
2. eSewa redirects to /dk/order?data=...
   ↓
3. Frontend calls /esewa/verify
   ↓
4. Backend verifies signature ✅
   ↓
5. Backend finds payment session (status: "pending")
   ↓
6. Backend calls authorizePaymentSession
   ↓
7. Payment service calls eSewa API ✅
   ↓
8. Payment service returns { status: "authorized", data: {...} }
   ↓
9. Medusa updates payment session status to "authorized" ✅
   ↓
10. Backend responds { success: true }
   ↓
11. Frontend calls cart.complete()
   ↓
12. Medusa checks: payment session status === "authorized" ✅
   ↓
13. Order created ✅
```

**Current issue is at step 9 or 12** - status not "authorized"

---

## 🧪 Debug Steps

### Step 1: Check Backend Logs

**Restart backend with logging:**
```bash
cd edailo
npm run dev
```

**Complete payment and check logs for:**
- "Authorized payment status: ???"
- Any error messages

### Step 2: Check Database

**After authorization attempt:**
```bash
psql -d medusa-edailo

SELECT id, status, provider_id, amount, data->>'status' as data_status
FROM payment_session 
WHERE provider_id = 'pp_esewa_esewa'
ORDER BY created_at DESC 
LIMIT 1;
```

**Should show:**
```
status: authorized
data_status: COMPLETE
```

### Step 3: Check Frontend Logs

**Browser console should show:**
```javascript
Verification result: { success: true, payment: {...} }
Payment verified successfully, completing order...
```

**Then either:**
```javascript
✅ Order created successfully: order_...
```

**Or:**
```javascript
❌ Session was not authorized with the provider
```

---

## 🔧 Quick Fix Attempt

If the issue is that `PaymentSessionStatus.AUTHORIZED` has the wrong value, we can try returning the string directly:

**In `edailo/src/modules/esewa-payment/service.ts`:**

```typescript
// Try this if PaymentSessionStatus.AUTHORIZED is wrong
return {
  status: "authorized" as any,  // Force string value
  data: {
    ...paymentSessionData,
    status: "COMPLETE",
    transaction_code,
    verified_at: new Date().toISOString(),
  },
}
```

---

## 📞 What to Share

Please share:

1. **Backend logs** - Everything from "=== eSewa Verification Request ===" to "=== Verification Complete ==="
2. **Specific line:** "Authorized payment status: ???"
3. **Database query result** - Payment session status
4. **Frontend error** - Full error message

This will help identify exactly where the authorization is failing.

---

**Check backend logs and share the "Authorized payment status" value!** 🔍
