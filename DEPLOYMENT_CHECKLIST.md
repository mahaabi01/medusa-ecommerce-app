# eSewa Integration - Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Development Environment

- [x] All code changes applied
- [x] No TypeScript errors
- [x] Environment variables configured
- [x] Documentation created

### 🧪 Testing Checklist

#### Backend Testing
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Payment provider registered (check logs for "esewa")
- [ ] Environment variables loaded correctly
- [ ] API endpoint `/api/esewa/verify` accessible

#### Admin Testing
- [ ] Can access Medusa Admin (`http://localhost:9000/app`)
- [ ] Can see eSewa in region payment providers
- [ ] Can enable eSewa for a region
- [ ] Region saves successfully with eSewa enabled

#### Storefront Testing
- [ ] Storefront starts without errors (`npm run dev`)
- [ ] Can browse products
- [ ] Can add products to cart
- [ ] Can proceed to checkout

#### Checkout Flow Testing
- [ ] Shipping address form works
- [ ] Billing address form works
- [ ] eSewa appears as payment option
- [ ] eSewa icon displays correctly
- [ ] Can select eSewa payment method
- [ ] "Continue to review" button works

#### Payment Testing
- [ ] Review page shows eSewa as selected method
- [ ] "Pay with eSewa" button appears
- [ ] Clicking button redirects to eSewa
- [ ] eSewa test page loads correctly

#### eSewa Gateway Testing
- [ ] Can login with test credentials
- [ ] Can see payment details
- [ ] Can confirm payment
- [ ] Redirects back to store after payment

#### Verification Testing
- [ ] Order page receives transaction details
- [ ] "Verifying payment..." message shows
- [ ] Backend verification API called
- [ ] Payment verified successfully
- [ ] Order created in database
- [ ] Redirected to order confirmation

#### Order Confirmation Testing
- [ ] Order confirmation page displays
- [ ] Order details are correct
- [ ] Payment status shows as paid
- [ ] Order appears in Medusa Admin
- [ ] Order status is correct in admin

---

## 🔍 Verification Steps

### 1. Check Backend Logs

```bash
cd edailo
npm run dev
```

Look for:
```
✓ Payment provider "esewa" registered
✓ Module loaded: esewa-payment
```

### 2. Check Environment Variables

```bash
# Backend
cd edailo
cat .env | grep ESEWA
cat .env | grep STOREFRONT_URL

# Storefront
cd edailo-storefront
cat .env.local | grep MEDUSA
```

Expected output:
```
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_ENVIRONMENT=test
STOREFRONT_URL=http://localhost:8000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

### 3. Test API Endpoint

```bash
# Test verification endpoint exists
curl -X POST http://localhost:9000/api/esewa/verify \
  -H "Content-Type: application/json" \
  -d '{"transaction_code":"test","transaction_uuid":"test","cart_id":"test"}'
```

Should return JSON (even if error, means endpoint exists)

### 4. Check Payment Session Creation

1. Add product to cart
2. Go to checkout
3. Select eSewa
4. Open browser DevTools → Network tab
5. Look for request to `initiatePaymentSession`
6. Check response includes payment session data

### 5. Verify Form Submission

1. Complete checkout to review page
2. Open browser DevTools → Console
3. Click "Pay with eSewa"
4. Should see form submission (no console errors)
5. Should redirect to eSewa

---

## 🐛 Common Issues & Solutions

### Issue: eSewa not appearing in checkout

**Check:**
- [ ] eSewa enabled in region (Medusa Admin)
- [ ] Region has eSewa in payment providers list
- [ ] Cart is using the correct region
- [ ] Backend restarted after enabling

**Fix:**
```bash
# Restart backend
cd edailo
npm run dev
```

---

### Issue: "Payment session not initialized"

**Check:**
- [ ] `ESEWA_MERCHANT_ID` is set
- [ ] `ESEWA_SECRET_KEY` is set
- [ ] Backend logs show no errors
- [ ] Payment provider registered successfully

**Fix:**
```bash
# Check environment
cd edailo
cat .env | grep ESEWA

# Rebuild if needed
npm run build
npm run dev
```

---

### Issue: Redirect to eSewa fails

**Check:**
- [ ] Payment session has `payment_url` field
- [ ] Form fields are populated
- [ ] Signature is generated correctly
- [ ] Browser console shows no errors

**Debug:**
```javascript
// In browser console before clicking "Pay with eSewa"
console.log(paymentSession.data)
```

---

### Issue: Verification fails after payment

**Check:**
- [ ] `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is set
- [ ] Backend is running
- [ ] `/api/esewa/verify` endpoint exists
- [ ] Transaction details in URL

**Debug:**
```bash
# Check URL after redirect from eSewa
# Should have: ?transaction_code=XXX&transaction_uuid=YYY&cart_id=ZZZ

# Check backend logs for verification request
cd edailo
npm run dev
# Look for POST /api/esewa/verify
```

---

### Issue: Order not created

**Check:**
- [ ] Payment verified successfully
- [ ] Cart exists and is valid
- [ ] Cart has all required fields
- [ ] No errors in browser console

**Debug:**
```javascript
// In browser console on order page
localStorage.getItem('cart_id')
// Should return cart ID
```

---

## 🚀 Production Deployment

### Before Going Live

#### 1. Get Production Credentials
- [ ] Register with eSewa for production account
- [ ] Obtain production merchant code
- [ ] Obtain production secret key
- [ ] Test credentials in eSewa merchant portal

#### 2. Update Environment Variables

**Backend Production `.env`:**
```bash
ESEWA_MERCHANT_ID=YOUR_PRODUCTION_MERCHANT_CODE
ESEWA_SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY
ESEWA_ENVIRONMENT=production
STOREFRONT_URL=https://yourdomain.com
```

**Storefront Production `.env.local`:**
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### 3. Security Checklist
- [ ] HTTPS enabled on all domains
- [ ] CORS configured correctly
- [ ] Environment variables secured
- [ ] Secret keys not in version control
- [ ] API endpoints protected
- [ ] Rate limiting configured

#### 4. Testing in Production
- [ ] Test with real eSewa account
- [ ] Test small amount first
- [ ] Verify order creation
- [ ] Verify payment status
- [ ] Test refund process (manual)

#### 5. Monitoring
- [ ] Set up error logging
- [ ] Monitor payment success rate
- [ ] Track failed payments
- [ ] Set up alerts for errors
- [ ] Monitor eSewa API responses

---

## 📊 Success Metrics

### Development
- ✅ All tests pass
- ✅ No console errors
- ✅ No backend errors
- ✅ Payment flow completes
- ✅ Order created successfully

### Production
- ✅ Payment success rate > 95%
- ✅ Average checkout time < 3 minutes
- ✅ Zero critical errors
- ✅ Customer satisfaction high
- ✅ Refund process working

---

## 📞 Support Contacts

### eSewa Support
- Website: https://esewa.com.np
- Developer Docs: https://developer.esewa.com.np
- Support Email: support@esewa.com.np

### Medusa Support
- Docs: https://docs.medusajs.com
- Discord: https://discord.gg/medusajs
- GitHub: https://github.com/medusajs/medusa

---

## 🎯 Final Checklist

Before marking as complete:

- [ ] All code changes committed
- [ ] Documentation reviewed
- [ ] Local testing completed
- [ ] No errors in console
- [ ] No errors in backend logs
- [ ] Payment flow works end-to-end
- [ ] Order confirmation works
- [ ] Admin shows correct order status
- [ ] Ready for production deployment

---

**Status: ✅ READY FOR TESTING**

All fixes have been applied. The integration is complete and ready for testing with eSewa test credentials.
