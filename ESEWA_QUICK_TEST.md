# eSewa Quick Test Guide

## 🚀 Quick Start (5 Minutes)

### 1. Start Services

```bash
# Terminal 1 - Backend
cd edailo
npm run dev

# Terminal 2 - Storefront  
cd edailo-storefront
npm run dev
```

### 2. Enable eSewa in Admin

1. Open: `http://localhost:9000/app`
2. Go to: **Settings** → **Regions** → **Edit Region**
3. Enable: **eSewa (pp_esewa_esewa)**
4. Save

### 3. Test Payment

1. Add product to cart: `http://localhost:8000`
2. Go to checkout
3. Fill shipping & billing address
4. Select **eSewa** payment method
5. Click **"Pay with eSewa"**

### 4. Use Test Credentials

On eSewa test page:
- **eSewa ID:** `9806800001`
- **Password:** `Nepal@123`
- **MPIN:** `1122`

### 5. Verify Success

- You'll be redirected back
- Order will be created
- Check order confirmation page

---

## ✅ Checklist

- [ ] Backend running on port 9000
- [ ] Storefront running on port 8000
- [ ] eSewa enabled in region
- [ ] Environment variables set
- [ ] Test payment completed
- [ ] Order created successfully

---

## 🐛 Quick Fixes

**eSewa not showing?**
→ Enable it in Medusa Admin region settings

**Redirect not working?**
→ Check `STOREFRONT_URL=http://localhost:8000` in backend `.env`

**Verification failed?**
→ Check `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000` in storefront `.env.local`

---

## 📋 Test Credentials

### eSewa Test Environment

| Field | Value |
|-------|-------|
| eSewa ID | 9806800001, 9806800002, or 9806800003 |
| Password | Nepal@123 |
| MPIN | 1122 or 1212 |
| Environment | Test (rc-epay.esewa.com.np) |

### Merchant Test Credentials (Already in .env)

| Field | Value |
|-------|-------|
| Merchant Code | EPAYTEST |
| Secret Key | 8gBm/:&EnhH.1/q |

---

## 🎯 Expected Flow

1. **Checkout** → Select eSewa → Continue to Review
2. **Review** → Click "Pay with eSewa" → Redirect to eSewa
3. **eSewa** → Login → Confirm Payment → Redirect back
4. **Verification** → Auto verify → Create order → Show confirmation

---

## 📊 Success Indicators

✅ eSewa option visible at checkout  
✅ Redirect to eSewa gateway works  
✅ Payment completes on eSewa  
✅ Redirect back to store works  
✅ Order created in Medusa Admin  
✅ Order status shows "Paid"  

---

## 🔍 Debug Commands

```bash
# Check backend logs
cd edailo
npm run dev

# Check environment variables
cat .env | grep ESEWA

# Check storefront environment
cd edailo-storefront
cat .env.local | grep MEDUSA
```

---

**Ready to test! 🎉**
