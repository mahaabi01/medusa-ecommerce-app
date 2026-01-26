# Quick Fix Guide - Payment Fails After OTP

## 🚀 Immediate Actions

### 1. Restart Backend (REQUIRED)
```bash
cd edailo
npm run dev
```

**Why:** Amount format was changed from "100.00" to "100"

### 2. Test Direct Integration First
```
Open: http://localhost:8000/test-esewa
Amount: 100
Click: "Test Payment with eSewa"
Complete payment
```

**This tests eSewa without Medusa to isolate the issue.**

### 3. Check What's Being Sent

Open browser console (F12) and look for:
```javascript
eSewa Payment Data: {
  amount: "100",        // ← Should be "100" NOT "100.00"
  total_amount: "100"   // ← Should be "100" NOT "100.00"
}
```

---

## 🎯 What Changed

### Amount Format Fix

**Before (Causing Failure):**
```
Amount sent to eSewa: "100.00"
```

**After (Should Work):**
```
Amount sent to eSewa: "100"
```

**Why:** eSewa test environment often rejects decimal amounts.

---

## ✅ Testing Checklist

- [ ] Backend restarted
- [ ] Test page works (`/test-esewa`)
- [ ] Console shows whole number amounts
- [ ] Backend logs show whole number amounts
- [ ] Payment completes on eSewa
- [ ] Redirects back successfully

---

## 🐛 If Still Failing

### Check Console Output
```javascript
// Look for this in console:
eSewa Payment Data: {
  amount: "???",  // What do you see here?
  total_amount: "???"  // And here?
}
```

### Check Backend Logs
```bash
# Look for this in terminal:
eSewa payment initiated: {
  amount_cents: 10000,
  amount_rupees: "100",  // ← Should be "100" not "100.00"
}
```

### Try These Amounts
- NPR 10
- NPR 100
- NPR 500
- NPR 1000

**Use whole numbers only!**

---

## 📞 Report Back

If still not working, provide:

1. **Console output:** What does "eSewa Payment Data" show?
2. **Backend log:** What does "eSewa payment initiated" show?
3. **Test page:** Does `/test-esewa` work?
4. **Amount:** What cart total are you testing with?

---

## 🎉 Expected Result

After restart:
1. ✅ `/test-esewa` should work
2. ✅ Checkout should work
3. ✅ Payment completes after OTP
4. ✅ Order is created

---

**Action:** Restart backend and test `/test-esewa` first!
