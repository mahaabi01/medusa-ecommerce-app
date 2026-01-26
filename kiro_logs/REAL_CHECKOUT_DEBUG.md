# Real Checkout Debugging Guide

## 🔍 Issue: Test Works, Real Checkout Doesn't

The test page works but the real Medusa checkout fails. Let's debug this systematically.

---

## 📊 Key Difference: Amount Handling

### Test Page
- You manually enter: **100**
- Sent to eSewa: **"100"** (rupees)
- Works: ✅

### Real Checkout
- Medusa cart total: **10000** (paisa)
- Should convert to: **"100"** (rupees)
- Needs verification: ❓

---

## 🧪 Debugging Steps

### Step 1: Check Backend Logs

When you go through real checkout, check backend terminal for:

```
eSewa payment initiated: {
  medusa_amount_paisa: 10000,
  esewa_amount_rupees: "100",
  conversion: "10000 paisa / 100 = 100 rupees",
  currency_code: "npr" or "usd",
  total_amount: "100"
}
```

**What to verify:**
- Is `medusa_amount_paisa` correct?
- Is `esewa_amount_rupees` correct?
- Is the conversion correct?

### Step 2: Check Browser Console

During real checkout, open console (F12) and look for:

```javascript
eSewa Payment Data: {
  amount: "100",        // ← Should match test page
  total_amount: "100",  // ← Should match test page
  transaction_uuid: "cart_xxx-123",
  product_code: "EPAYTEST",
  signature: "base64_string"
}
```

**Compare with test page:**
- Are the amounts the same?
- Is the signature format the same?
- Are all fields present?

### Step 3: Check Cart Currency

The issue might be currency-related. Check what currency your cart is using:

```bash
# In backend logs, look for:
currency_code: "npr" or "usd" or "dkk"
```

**If currency is NOT NPR:**
- Medusa might be storing amounts differently
- The /100 conversion might be wrong

---

## 🎯 Common Issues

### Issue 1: Wrong Currency

**Problem:** Cart is in USD or DKK, not NPR

**Check:**
```javascript
// In console, check cart object:
cart.currency_code  // Should be "npr" for Nepal
```

**Solution:**
- Create a Nepal region in Medusa Admin
- Set currency to NPR
- Test with NPR cart

### Issue 2: Amount Mismatch

**Problem:** Real checkout sends different amount than test

**Check Backend Log:**
```
medusa_amount_paisa: ???
esewa_amount_rupees: "???"
```

**If amounts don't match test:**
- Cart total might be wrong
- Conversion might be wrong
- Currency might be wrong

### Issue 3: Signature Mismatch

**Problem:** Signature generated differently in real checkout

**Check Console:**
```javascript
// Compare signatures:
Test page signature: "abc123..."
Real checkout signature: "xyz789..."
```

**If different:**
- Transaction UUID format might be different
- Amount format might be different
- Product code might be different

### Issue 4: Success/Failure URL

**Problem:** URLs are different between test and real

**Check Console:**
```javascript
success_url: "???"
failure_url: "???"
```

**Should be:**
```
success_url: "http://localhost:8000/order?transaction_uuid=xxx&cart_id=yyy"
failure_url: "http://localhost:8000/dk/checkout?step=payment&error=payment_failed"
```

---

## 🔧 Diagnostic Commands

### 1. Check What's Being Sent

```bash
# Restart backend with logging
cd edailo
npm run dev

# Go through checkout
# Look for "eSewa payment initiated" log
```

### 2. Compare Test vs Real

Create a comparison table:

| Field | Test Page | Real Checkout | Match? |
|-------|-----------|---------------|--------|
| amount | "100" | ??? | ❓ |
| total_amount | "100" | ??? | ❓ |
| transaction_uuid | "test-123" | "cart_xxx-123" | ❓ |
| product_code | "EPAYTEST" | ??? | ❓ |
| signature | "abc..." | ??? | ❓ |

### 3. Check Cart Total

```javascript
// In browser console on checkout page:
// Open DevTools → Console
// Type:
cart.total  // Should show amount in paisa
cart.currency_code  // Should show currency
```

---

## 📋 Information Needed

To help debug, please provide:

### From Backend Logs:
```
eSewa payment initiated: {
  medusa_amount_paisa: ???,
  esewa_amount_rupees: "???",
  conversion: "???",
  currency_code: "???",
  total_amount: "???"
}
```

### From Browser Console:
```javascript
eSewa Payment Data: {
  amount: "???",
  total_amount: "???",
  transaction_uuid: "???",
  product_code: "???",
  signature: "???"
}
```

### Cart Information:
```
Cart Total: ??? (in Medusa)
Currency: ???
Expected eSewa Amount: ???
```

---

## 🎯 Quick Test

### Test with Exact Same Amount

1. **In test page:** Use amount **100**
2. **In real checkout:** Create cart with total **NPR 100**
3. **Compare:** Do both work?

If test works but real doesn't with same amount:
- Issue is NOT amount conversion
- Issue is likely:
  - Transaction UUID format
  - Success/Failure URLs
  - Signature generation
  - Form submission

---

## ✅ Verification Checklist

- [ ] Backend logs show correct conversion
- [ ] Console shows same format as test page
- [ ] Amount matches between test and real
- [ ] Signature format is identical
- [ ] All required fields present
- [ ] URLs are correct and accessible
- [ ] Currency is NPR (if applicable)

---

## 🚀 Next Steps

1. **Restart backend** to get new logs
2. **Go through real checkout** with console open
3. **Copy backend log** for "eSewa payment initiated"
4. **Copy console log** for "eSewa Payment Data"
5. **Compare** with test page values
6. **Report back** with the logs

---

**The logs will tell us exactly what's different between test and real checkout!**
