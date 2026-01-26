# 🚀 Quick Test Guide - eSewa Integration

## ⚡ Quick Start (3 Steps)

### 1. Restart Servers
```bash
# Terminal 1 - Backend
cd edailo
npm run dev

# Terminal 2 - Frontend  
cd edailo-storefront
npm run dev
```

### 2. Test Payment
1. Go to: http://localhost:8000/dk/store
2. Add product → Checkout → Select eSewa
3. Pay with: 9806800001 / Nepal@123 / MPIN: 1122

### 3. Verify Success
✅ No CORS errors in console
✅ Redirects to order confirmation
✅ Order created successfully

---

## 🐛 Quick Debug

### CORS Error?
```bash
# 1. Restart backend (MUST DO!)
cd edailo
npm run dev

# 2. Hard refresh browser
Ctrl + Shift + R
```

### Order Not Created?
```javascript
// Check cart ID in browser console
console.log(localStorage.getItem("cart_id"))
```

### Wrong Amount?
```
Check: Amount should be in Rupees (not Paisa)
Example: 100 NPR shows as "100.0" on eSewa
```

---

## ✅ Success Checklist

- [ ] Backend running on port 9000
- [ ] Frontend running on port 8000
- [ ] Payment completes on eSewa
- [ ] No CORS errors in console
- [ ] Redirects to `/dk/order/{id}/confirmed`
- [ ] Order shows in confirmation page

---

## 📞 Still Having Issues?

Check these files:
1. `ESEWA_INTEGRATION_COMPLETE.md` - Full guide
2. `BACKEND_RESTART_REQUIRED.md` - Detailed fixes
3. Backend terminal - Error logs
4. Browser console - Error messages

---

**Test now and report any issues!** 🎯
