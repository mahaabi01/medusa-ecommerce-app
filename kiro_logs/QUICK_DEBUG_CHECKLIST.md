# ⚡ Quick Debug Checklist

## 🔴 Issue: Payment session data is empty

---

## ✅ Checklist

### 1. Backend Running?
```bash
cd edailo
# Should see: "Server is ready on port 9000"
```
- [ ] Backend is running
- [ ] No error messages in terminal

### 2. Environment Variables Set?
```bash
cat edailo/.env | grep ESEWA
```
**Should show:**
```
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_ENVIRONMENT=test
STOREFRONT_URL=http://localhost:8000
```
- [ ] All 4 variables present
- [ ] No typos in values

### 3. Backend Logs Show initiatePayment?
**When you select eSewa at checkout, backend should log:**
```
=== eSewa initiatePayment ===
Amount: 90
Currency: npr
```
- [ ] Logs appear when selecting eSewa
- [ ] No errors after the logs

### 4. Browser Console Shows Session Data?
**Click "Pay with eSewa" and check console:**
```javascript
=== Payment Session Debug ===
Session data: { amount: "90", ... }
```
- [ ] Session data has values (not empty {})
- [ ] All required fields present

---

## 🚨 If Checklist Fails

### Backend Not Showing Logs?
**→ Payment provider not loaded**

**Fix:**
1. Check `edailo/medusa-config.ts` has payment module
2. Restart backend: `cd edailo && npm run dev`
3. Look for "Payment providers loaded" at startup

### Session Data Empty?
**→ initiatePayment failed or returned empty**

**Fix:**
1. Check backend logs for errors
2. Clear build cache: `rm -rf edailo/.medusa/server/dist`
3. Restart: `npm run dev`

### Environment Variables Missing?
**→ Update .env file**

**Fix:**
1. Edit `edailo/.env`
2. Add missing variables
3. Restart backend

---

## 📋 What to Share

If still not working, share:

1. **Backend terminal output** (full)
2. **Browser console output** (after clicking Pay with eSewa)
3. **Environment variables** (cat edailo/.env | grep ESEWA)

---

**Start with Step 1 and work through the checklist!** ✅
