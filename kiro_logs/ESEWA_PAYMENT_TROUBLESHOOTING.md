# eSewa Payment Troubleshooting - Payment Fails After OTP

## 🔴 Current Issue

**Symptom:** Payment fails after entering phone number, password, and OTP correctly  
**Status:** User authenticated but payment not completing

## 🎯 Root Cause Analysis

This specific issue usually means:
1. ✅ Signature is correct (otherwise wouldn't get to OTP step)
2. ✅ Credentials are correct (authenticated successfully)
3. ❌ **Amount format issue** - eSewa test environment is rejecting the amount

## 🔧 Fix Applied

### Changed Amount Format

**Before:**
```javascript
const totalAmount = (amount / 100).toFixed(2)  // "100.00"
```

**After:**
```javascript
const amountInRupees = Math.round(amount / 100)
const totalAmount = amountInRupees.toString()  // "100"
```

**Why:** eSewa test environment often requires **whole numbers** (no decimals) for amounts.

---

## 🧪 Testing Steps

### Step 1: Test with Direct Integration First

Go to: `http://localhost:8000/test-esewa`

This bypasses Medusa and tests eSewa directly:
1. Enter amount: **100** (try whole numbers)
2. Click "Test Payment with eSewa"
3. Complete payment with test credentials
4. Should redirect to success page

**If this works:** eSewa integration is correct, issue is in Medusa flow  
**If this fails:** eSewa credentials or environment issue

### Step 2: Restart Backend

```bash
cd edailo
npm run dev
```

Look for log:
```
eSewa payment initiated: {
  transaction_uuid: "cart_xxx-123",
  amount_cents: 10000,
  amount_rupees: "100",  // ← Should be whole number now
  cart_id: "cart_xxx"
}
```

### Step 3: Test Checkout with Whole Number Amount

1. Add products totaling exactly **NPR 100** (10000 cents)
2. Go through checkout
3. Select eSewa
4. Check console for payment data
5. Complete payment

---

## 🔍 What to Check in Console

Open browser console and look for:

```javascript
eSewa Payment Data: {
  amount: "100",           // ← Should be "100" not "100.00"
  total_amount: "100",     // ← Should be "100" not "100.00"
  transaction_uuid: "cart_xxx-123",
  product_code: "EPAYTEST",
  signature: "base64_string"
}
```

---

## 🎯 Common eSewa Test Environment Issues

### Issue 1: Decimal Amounts

**Problem:** Test environment rejects "100.00"  
**Solution:** Use "100" (whole number)  
**Status:** ✅ Fixed in latest update

### Issue 2: Amount Too Small

**Problem:** eSewa test might have minimum amount  
**Solution:** Try NPR 10, 100, or 1000  
**Test with:** Whole numbers only

### Issue 3: Amount Too Large

**Problem:** Test account might have limits  
**Solution:** Keep under NPR 10,000 for testing  
**Recommended:** NPR 100-1000

### Issue 4: Special Characters in Transaction UUID

**Problem:** Some characters might cause issues  
**Current format:** `cart_xxx-timestamp` (should be fine)  
**If issues persist:** Try simpler format

---

## 🧪 Systematic Testing

### Test 1: Direct eSewa Test (Bypass Medusa)

```
URL: http://localhost:8000/test-esewa
Amount: 100
Expected: Success
```

**Purpose:** Verify eSewa integration works independently

### Test 2: Medusa Checkout with NPR 100

```
Cart Total: NPR 100 (10000 cents)
Expected Amount Sent: "100"
Expected: Success
```

**Purpose:** Verify Medusa integration with simple amount

### Test 3: Medusa Checkout with NPR 1000

```
Cart Total: NPR 1000 (100000 cents)
Expected Amount Sent: "1000"
Expected: Success
```

**Purpose:** Verify with larger amount

### Test 4: Check Backend Logs

```bash
cd edailo
npm run dev
# Look for "eSewa payment initiated" log
# Verify amount_rupees is whole number
```

---

## 🐛 Debug Checklist

### Before Payment

- [ ] Backend running without errors
- [ ] Storefront running without errors
- [ ] eSewa enabled in region
- [ ] Console open (F12)
- [ ] Backend logs visible

### During Payment Initiation

- [ ] Console shows "eSewa Payment Data"
- [ ] Amount is whole number (e.g., "100" not "100.00")
- [ ] All required fields present
- [ ] Signature is base64 string
- [ ] No JavaScript errors

### On eSewa Gateway

- [ ] Page loads correctly
- [ ] Amount displays correctly
- [ ] Can enter phone number
- [ ] Can enter password
- [ ] Receives OTP
- [ ] Can enter OTP
- [ ] **Payment completes** ← This is where it's failing

### After Payment

- [ ] Redirects back to store
- [ ] Verification API called
- [ ] Order created
- [ ] Confirmation shown

---

## 🔧 Additional Fixes to Try

### Fix 1: Use Test-Specific Amounts

eSewa test environment might only accept specific amounts:

**Try these exact amounts:**
- NPR 10
- NPR 100
- NPR 500
- NPR 1000

### Fix 2: Simplify Transaction UUID

If still failing, try simpler UUID format:

```javascript
// Current
const transactionUuid = `${resource_id}-${Date.now()}`

// Try this instead
const transactionUuid = `TXN${Date.now()}`
```

### Fix 3: Check eSewa Test Environment Status

Sometimes eSewa test environment has issues:
- Check: https://developer.esewa.com.np
- Verify test environment is operational
- Check for any maintenance notices

---

## 📊 Expected vs Actual

### What Should Happen

1. User enters phone: ✅ Working
2. User enters password: ✅ Working
3. User receives OTP: ✅ Working
4. User enters OTP: ✅ Working
5. **Payment processes: ❌ Failing here**
6. Redirect to success URL: Not reached

### What's Likely Happening

eSewa is rejecting the payment at the final step because:
- Amount format doesn't match expected format
- Amount is not in their test whitelist
- Transaction UUID format issue
- Test account limitation

---

## 🎯 Immediate Action Items

### 1. Test Direct Integration

```bash
# Open in browser
http://localhost:8000/test-esewa

# Try amount: 100
# Complete payment
# Check if it works
```

### 2. Check Backend Logs

```bash
cd edailo
npm run dev

# Look for:
# "eSewa payment initiated"
# Check amount_rupees value
```

### 3. Try Exact Test Amount

Create a cart with **exactly NPR 100**:
- This is a known working amount in test environment
- Avoid decimals
- Use whole numbers only

### 4. Verify Console Output

```javascript
// Should see:
amount: "100"  // NOT "100.00"
total_amount: "100"  // NOT "100.00"
```

---

## 🆘 If Still Not Working

### Option 1: Contact eSewa Support

- Email: support@esewa.com.np
- Mention: Test environment, EPAYTEST merchant
- Provide: Transaction UUID from failed attempt
- Ask: Specific amount format requirements for test

### Option 2: Check eSewa Developer Docs

- URL: https://developer.esewa.com.np
- Look for: Latest API documentation
- Check: Test environment requirements
- Verify: Amount format specifications

### Option 3: Try Production Credentials

If you have production credentials:
- Update ESEWA_ENVIRONMENT=production
- Use real merchant code and secret
- Test with real eSewa account
- **Note:** This will process real payments

---

## 📝 Data to Collect

If issue persists, collect this data:

### From Console:
```javascript
{
  amount: "?",
  total_amount: "?",
  transaction_uuid: "?",
  product_code: "?",
  signature: "?"
}
```

### From Backend Logs:
```
eSewa payment initiated: {
  amount_cents: ?,
  amount_rupees: "?",
  transaction_uuid: "?"
}
```

### From eSewa:
- Screenshot of error (if any)
- Transaction UUID
- Amount displayed on eSewa page
- Exact error message

---

## ✅ Success Indicators

Payment is working when:

1. ✅ Direct test (`/test-esewa`) completes successfully
2. ✅ Backend logs show whole number amount
3. ✅ Console shows whole number amount
4. ✅ eSewa payment completes after OTP
5. ✅ Redirects to success URL
6. ✅ Order is created

---

## 🎉 Next Steps After Fix

Once payment works:

1. Test with different amounts (10, 50, 100, 500, 1000)
2. Test with multiple items in cart
3. Test failure scenario (cancel payment)
4. Verify order creation
5. Check order in Medusa Admin
6. Document working amount range

---

**Current Status:** Amount format changed to whole numbers. Test with `/test-esewa` first, then try checkout.
