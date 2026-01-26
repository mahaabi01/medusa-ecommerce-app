# eSewa Payment Integration Analysis for Medusa E-commerce

## Executive Summary

Your eSewa integration follows the correct Medusa v2 payment provider pattern but has **several critical issues** that need to be addressed. The blog post you referenced is for a generic Next.js + Strapi setup, which differs significantly from Medusa's architecture.

---

## ✅ What's Correct

### 1. **Backend Payment Provider Structure**
- ✅ Correctly extends `AbstractPaymentProvider`
- ✅ Proper module registration using `ModuleProvider`
- ✅ Implements all required methods (initiatePayment, authorizePayment, capturePayment, etc.)
- ✅ Signature generation using HMAC-SHA256 matches eSewa v2 requirements
- ✅ Proper payment URLs for test/production environments

### 2. **Configuration Pattern**
- ✅ Follows Medusa's module configuration in `medusa-config.ts`
- ✅ Environment variables properly defined
- ✅ Provider ID format follows convention

---

## ❌ Critical Issues Found

### 1. **TYPO in medusa-config.ts** 🚨
**Location:** `edailo/medusa-config.ts:25`

```typescript
// WRONG - Typo in "merchanId"
merchanId: process.env.ESEWA_MERCHANT_ID,

// CORRECT - Should be "merchantId"
merchantId: process.env.ESEWA_MERCHANT_ID,
```

**Impact:** This will cause the payment provider to fail initialization because the service expects `merchantId` but receives `merchanId`.

---

### 2. **Missing Payment Session Initialization in Storefront**

**Problem:** The checkout page (`edailo-storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx`) has incomplete code:

```typescript
// Current code - paymentSession is never set!
const [paymentSession, setPaymentSession] = useState<any>(null)

// Missing: Call to initiatePaymentSession
```

**Solution:** You need to call `initiatePaymentSession` when the user selects eSewa:

```typescript
const handlePaymentMethodChange = async (providerId: string) => {
  setSelectedProvider(providerId)
  
  if (providerId === "pp_esewa_esewa") {
    const session = await initiatePaymentSession(cart, {
      provider_id: providerId
    })
    setPaymentSession(session)
  }
}
```

---

### 3. **Incorrect Provider ID Reference**

**Issue:** The provider ID format is inconsistent.

According to Medusa documentation, the provider ID should be: `pp_{identifier}_{id}`

- Your module ID: `esewa`
- Your service identifier: `esewa`
- **Correct Provider ID:** `pp_esewa_esewa` ✅

This is actually correct in your code, but ensure it's consistent everywhere.

---

### 4. **Missing Cart Context in Payment Initiation**

**Location:** `edailo/src/modules/esewa-payment/service.ts:88-89`

```typescript
success_url: cart_context.success_url || `${process.env.STOREFRONT_URL}/order/confirmed`,
failure_url: cart_context.failure_url || `${process.env.STOREFRONT_URL}/checkout`,
```

**Problems:**
- `process.env.STOREFRONT_URL` is not defined in your `.env` file
- The success URL should include cart/order information
- The URLs need to be absolute and publicly accessible

**Fix:**
```typescript
success_url: cart_context.success_url || 
  `${process.env.STOREFRONT_URL}/order?transaction_uuid=${transactionUuid}&cart_id=${resource_id}`,
failure_url: cart_context.failure_url || 
  `${process.env.STOREFRONT_URL}/checkout?error=payment_failed`,
```

Add to `.env`:
```bash
STOREFRONT_URL=http://localhost:8000
```

---

### 5. **Payment Verification Flow Issues**

**Location:** `edailo-storefront/src/app/order/page.tsx`

**Problems:**

a) **Missing Environment Variable:**
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/esewa/verify`, {
```
This variable is defined as `MEDUSA_BACKEND_URL` in your `.env.local`, not `NEXT_PUBLIC_MEDUSA_BACKEND_URL`.

b) **Incorrect API Endpoint:**
The verification endpoint should be `/api/esewa/verify` not `/esewa/verify`.

c) **Cart Completion Before Authorization:**
You're calling `sdk.store.cart.complete(cartId)` but the payment might not be authorized yet in Medusa's system.

**Correct Flow:**
```typescript
// 1. Verify payment with backend
const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/api/esewa/verify`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    transaction_code: transactionCode,
    transaction_uuid: transactionUuid,
    cart_id: cartId,
  }),
})

const result = await response.json()

if (result.success) {
  // 2. The backend should have already authorized the payment
  // 3. Now complete the cart to create the order
  const order = await sdk.store.cart.complete(cartId)
  
  // 4. Redirect to order confirmation
  router.push(`/${countryCode}/order/${order.id}/confirmed`)
}
```

---

### 6. **Verification API Route Issues**

**Location:** `edailo/src/api/esewa/verify/route.ts`

**Problems:**

a) **Incorrect Payment Collection Query:**
```typescript
const paymentCollections = await paymentModuleService.listPaymentCollections({
  cart_id,
})
```
This won't work because `listPaymentCollections` doesn't accept `cart_id` directly.

b) **Missing Payment Session Data:**
The payment session data (total_amount) needed for verification isn't being passed.

**Correct Implementation:**
```typescript
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const paymentModuleService: IPaymentModuleService = req.scope.resolve(
    ModuleRegistrationName.PAYMENT
  )

  const { transaction_code, transaction_uuid, cart_id } = req.body

  try {
    // Get cart to find payment collection
    const cartModuleService = req.scope.resolve(ModuleRegistrationName.CART)
    const cart = await cartModuleService.retrieve(cart_id, {
      relations: ["payment_collection"]
    })

    if (!cart.payment_collection) {
      res.status(404).json({ error: "Payment collection not found" })
      return
    }

    // Get payment sessions
    const paymentCollection = await paymentModuleService.retrievePaymentCollection(
      cart.payment_collection.id,
      { relations: ["payment_sessions"] }
    )

    const paymentSession = paymentCollection.payment_sessions?.find(
      (session) => session.provider_id === "pp_esewa_esewa"
    )

    if (!paymentSession) {
      res.status(404).json({ error: "eSewa payment session not found" })
      return
    }

    // Authorize the payment with transaction details
    const authorizedPayment = await paymentModuleService.authorizePaymentSession(
      paymentSession.id,
      {
        transaction_code,
        transaction_uuid,
      }
    )

    res.json({
      success: true,
      payment: authorizedPayment,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}
```

---

### 7. **Missing Environment Variables**

Add to `edailo/.env`:
```bash
STOREFRONT_URL=http://localhost:8000
```

Add to `edailo-storefront/.env.local`:
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

---

### 8. **Checkout Page Implementation Issues**

**Location:** `edailo-storefront/src/app/[countryCode]/(checkout)/checkout/page.tsx`

**Problems:**
- Using `useState` in a server component (async function)
- Commented out the actual checkout form
- Missing proper integration with Medusa's checkout flow

**Solution:** You need to use the existing Medusa checkout components and extend them:

```typescript
// This should be a client component or use proper server/client separation
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"

export default async function Checkout() {
  const cart = await retrieveCart()
  if (!cart) return notFound()
  
  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
```

Then modify the payment component to include eSewa:
`edailo-storefront/src/modules/checkout/components/payment/index.tsx`

---

## 📊 Comparison: Blog Post vs. Your Implementation

### Blog Post Approach (Next.js + Strapi)
- ✅ Correct eSewa signature generation
- ✅ Correct form submission to eSewa
- ✅ Proper callback handling
- ❌ **Not applicable** to Medusa architecture
- ❌ Uses custom API routes instead of Medusa's payment module
- ❌ Manual order creation in Strapi

### Your Medusa Implementation
- ✅ Follows Medusa's payment provider pattern
- ✅ Integrates with Medusa's payment module
- ✅ Uses Medusa's order creation flow
- ❌ Has implementation bugs (typos, missing initialization)
- ❌ Incomplete storefront integration

---

## 🔧 Required Fixes (Priority Order)

### 1. **CRITICAL - Fix Typo** (5 minutes)
Fix `merchanId` → `merchantId` in `medusa-config.ts`

### 2. **HIGH - Add Environment Variables** (2 minutes)
Add missing `STOREFRONT_URL` and `NEXT_PUBLIC_MEDUSA_BACKEND_URL`

### 3. **HIGH - Fix Verification API** (30 minutes)
Implement correct payment collection retrieval and authorization

### 4. **HIGH - Fix Checkout Flow** (1 hour)
Properly integrate payment session initialization in the storefront

### 5. **MEDIUM - Fix Success URL** (15 minutes)
Include proper parameters in success/failure URLs

### 6. **MEDIUM - Fix Order Page** (30 minutes)
Correct the verification flow and cart completion

---

## ✨ Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STOREFRONT (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  1. User selects eSewa                                       │
│  2. Call initiatePaymentSession() → Creates session          │
│  3. Render EsewaPayment component with session data          │
│  4. User clicks "Pay with eSewa"                             │
│  5. Form submits to eSewa gateway                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  ESEWA GATEWAY                               │
├─────────────────────────────────────────────────────────────┤
│  6. User authenticates and confirms payment                  │
│  7. eSewa redirects to success_url with transaction_code     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              STOREFRONT - Order Page                         │
├─────────────────────────────────────────────────────────────┤
│  8. Extract transaction_code & transaction_uuid from URL     │
│  9. Call /api/esewa/verify with transaction details          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MEDUSA BACKEND - Verify API                     │
├─────────────────────────────────────────────────────────────┤
│  10. Retrieve payment session from cart                      │
│  11. Call authorizePaymentSession()                          │
│      → EsewaPaymentService.authorizePayment()                │
│      → Verifies with eSewa API                               │
│      → Updates session status to AUTHORIZED                  │
│  12. Return success response                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              STOREFRONT - Complete Order                     │
├─────────────────────────────────────────────────────────────┤
│  13. Call sdk.store.cart.complete()                          │
│  14. Medusa creates order from cart                          │
│  15. Redirect to order confirmation page                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Key Differences from Blog Post

| Aspect | Blog (Next.js + Strapi) | Your Medusa Implementation |
|--------|-------------------------|----------------------------|
| **Payment Provider** | Custom API route | Medusa Payment Module |
| **Signature Generation** | In API route | In Payment Service |
| **Payment Session** | Manual creation | Medusa's initiatePaymentSession |
| **Verification** | Custom endpoint | Payment Module's authorizePaymentSession |
| **Order Creation** | Manual Strapi API call | Medusa's cart.complete() |
| **State Management** | Manual in Strapi | Medusa's payment state machine |

---

## 🎯 Testing Checklist

- [ ] Fix the `merchantId` typo
- [ ] Add all environment variables
- [ ] Test payment session creation
- [ ] Test form submission to eSewa
- [ ] Test eSewa callback with test credentials
- [ ] Test payment verification API
- [ ] Test order completion
- [ ] Test failure scenarios
- [ ] Enable eSewa provider in Medusa Admin for your region
- [ ] Test end-to-end checkout flow

---

## 🔐 Security Considerations

1. ✅ **Signature Verification:** Properly implemented
2. ✅ **Server-side Verification:** Using eSewa's status API
3. ⚠️ **HTTPS Required:** Ensure production uses HTTPS
4. ⚠️ **CORS Configuration:** Verify CORS settings allow eSewa callbacks
5. ✅ **Secret Key Protection:** Kept server-side only

---

## 📚 Additional Resources

- [Medusa Payment Module Docs](https://docs.medusajs.com/resources/commerce-modules/payment)
- [Medusa Payment Provider Guide](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider)
- [eSewa Integration Guide](https://developer.esewa.com.np/)

---

## Conclusion

Your implementation is **80% correct** and follows Medusa's architecture properly. The blog post provides good eSewa-specific guidance but isn't directly applicable to Medusa. Focus on fixing the critical bugs listed above, and your integration will work correctly.
