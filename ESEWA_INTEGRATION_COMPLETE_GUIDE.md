# 🎯 Complete eSewa Integration Guide for Medusa v2

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
4. [Files Created/Modified](#files-createdmodified)
5. [How It Works](#how-it-works)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide documents the complete integration of eSewa payment gateway into a Medusa v2 e-commerce application. eSewa is a popular digital wallet and payment service in Nepal.

### What Was Implemented

- ✅ Custom payment provider for eSewa
- ✅ Payment initiation with signature generation
- ✅ Payment verification endpoint
- ✅ Signature verification for security
- ✅ Order completion flow
- ✅ Frontend payment button and verification
- ✅ Error handling and logging

### Technology Stack

- **Backend:** Medusa v2 (Node.js)
- **Frontend:** Next.js 14 (React)
- **Payment Gateway:** eSewa (Nepal)
- **Database:** PostgreSQL

---

## Architecture

### Payment Flow Diagram

```
┌─────────────┐
│   Customer  │
└──────┬──────┘
       │ 1. Add to cart & checkout
       ▼
┌─────────────────────────────────┐
│   Medusa Backend                │
│   - Creates payment session     │
│   - Generates transaction UUID  │
│   - Creates eSewa signature     │
└──────┬──────────────────────────┘
       │ 2. Payment session data
       ▼
┌─────────────────────────────────┐
│   Next.js Frontend              │
│   - Stores cart ID              │
│   - Submits form to eSewa       │
└──────┬──────────────────────────┘
       │ 3. Redirect to eSewa
       ▼
┌─────────────────────────────────┐
│   eSewa Payment Portal          │
│   - Customer enters credentials │
│   - Completes payment           │
└──────┬──────────────────────────┘
       │ 4. Redirect back with data
       ▼
┌─────────────────────────────────┐
│   Next.js Frontend              │
│   - Decodes eSewa response      │
│   - Calls verification API      │
└──────┬──────────────────────────┘
       │ 5. Verify payment
       ▼
┌─────────────────────────────────┐
│   Medusa Backend                │
│   - Verifies signature          │
│   - Calls eSewa API             │
│   - Authorizes payment          │
│   - Completes payment collection│
└──────┬──────────────────────────┘
       │ 6. Payment authorized
       ▼
┌─────────────────────────────────┐
│   Next.js Frontend              │
│   - Completes cart              │
│   - Creates order               │
│   - Shows confirmation          │
└─────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Backend - Payment Provider Module

#### 1.1 Create Module Structure

```
edailo/src/modules/esewa-payment/
├── index.ts          # Module registration
└── service.ts        # Payment provider service
```

#### 1.2 Module Registration (`index.ts`)

```typescript
import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { EsewaPaymentService } from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [EsewaPaymentService]
})
```

#### 1.3 Payment Service (`service.ts`)

**Key Methods Implemented:**

1. **`initiatePayment`** - Creates payment session with eSewa data
   - Generates transaction UUID
   - Calculates amounts
   - Creates HMAC-SHA256 signature
   - Returns payment URL and form data

2. **`authorizePayment`** - Verifies and authorizes payment
   - Extracts context from payment session data
   - Calls eSewa verification API
   - Returns authorization status

3. **`getPaymentStatus`** - Returns payment session status

4. **`capturePayment`** - Captures authorized payment (auto-captured for eSewa)

5. **Helper Methods:**
   - `generateSignature()` - Creates HMAC-SHA256 signature
   - `verifyPayment()` - Calls eSewa transaction status API
   - `getPaymentUrl()` - Returns test/production URL

**Key Implementation Details:**

- **Amount Handling:** Medusa stores amounts in Rupees (not Paisa), so no conversion needed
- **Signature Format:** `total_amount,transaction_uuid,product_code`
- **Transaction UUID:** Format: `{cart_id}-{timestamp}`
- **Context Extraction:** Context is nested in `paymentSessionData.context`, not a separate parameter

---

### Step 2: Backend - Verification API Endpoint

#### 2.1 Create API Route

```
edailo/src/api/esewa/verify/
└── route.ts          # POST endpoint for payment verification
```

#### 2.2 Verification Endpoint (`route.ts`)

**Responsibilities:**

1. **Signature Verification**
   - Receives eSewa response data
   - Reconstructs signature message
   - Verifies HMAC-SHA256 signature
   - Prevents tampering

2. **Payment Status Check**
   - Ensures status is "COMPLETE"
   - Rejects incomplete payments

3. **Cart & Session Lookup**
   - Finds cart by ID
   - Locates eSewa payment session
   - Validates transaction UUID

4. **Payment Authorization**
   - Calls `authorizePaymentSession`
   - Completes payment collection
   - Enables order creation

**Security Measures:**

- Signature verification using secret key
- Transaction UUID matching
- Status validation
- Cart ownership verification

---

### Step 3: Backend - CORS Middleware

#### 3.1 Create Middleware

```
edailo/src/api/
└── middlewares.ts    # CORS configuration
```

#### 3.2 CORS Configuration

**Purpose:** Allow frontend to call `/esewa/*` endpoints

**Implementation:**
- Custom middleware (no external package needed)
- Handles OPTIONS preflight requests
- Sets CORS headers for allowed origins
- Supports credentials

---

### Step 4: Backend - Configuration

#### 4.1 Medusa Config (`medusa-config.ts`)

```typescript
modules: [
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "./src/modules/esewa-payment",
          id: "esewa",
          options: {
            merchantId: process.env.ESEWA_MERCHANT_ID,
            secretKey: process.env.ESEWA_SECRET_KEY,
            environment: process.env.ESEWA_ENVIRONMENT || "test",
          },
        },
      ],
    },
  },
]
```

#### 4.2 Environment Variables (`.env`)

```bash
# eSewa Configuration
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_ENVIRONMENT=test
STOREFRONT_URL=http://localhost:8000

# CORS Configuration
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
```

---

### Step 5: Frontend - Payment Button

#### 5.1 Update Payment Button Component

**File:** `edailo-storefront/src/modules/checkout/components/payment-button/index.tsx`

**Implementation:**

```typescript
const EsewaPaymentButton = ({ cart, notReady }) => {
  const handlePayment = () => {
    // 1. Store cart ID in localStorage
    localStorage.setItem("cart_id", cart.id)
    
    // 2. Get payment session data
    const session = cart.payment_collection.payment_sessions.find(
      s => s.provider_id === "pp_esewa_esewa"
    )
    
    // 3. Create form with eSewa fields
    const form = document.createElement("form")
    form.method = "POST"
    form.action = session.data.payment_url
    
    // 4. Add all required fields
    // amount, total_amount, transaction_uuid, product_code, signature, etc.
    
    // 5. Submit to eSewa
    form.submit()
  }
  
  return <Button onClick={handlePayment}>Pay with eSewa</Button>
}
```

**Key Points:**
- Always use `cart.id` (real Medusa cart ID)
- Validate all required fields before submission
- Store cart ID for verification step

---

### Step 6: Frontend - Payment Verification Page

#### 6.1 Create Verification Page

**File:** `edailo-storefront/src/app/[countryCode]/(main)/order/page.tsx`

**Flow:**

```typescript
1. Decode eSewa response from URL parameter
   const encodedData = searchParams.get("data")
   const decodedData = JSON.parse(atob(encodedData))

2. Verify signature and status
   if (status !== "COMPLETE") redirect to failure page

3. Call backend verification API
   POST /esewa/verify
   Body: { transaction_code, transaction_uuid, cart_id, total_amount, status, signature }

4. Complete cart to create order
   const response = await sdk.store.cart.complete(cartId)

5. Redirect to order confirmation
   router.push(`/${countryCode}/order/${response.order.id}/confirmed`)
```

**Error Handling:**
- Invalid signature → Show error
- Payment not complete → Redirect to failure page
- Cart not found → Show error message
- Order creation fails → Show error with support message

---

### Step 7: Frontend - eSewa Icon & Configuration

#### 7.1 Create eSewa Icon

**File:** `edailo-storefront/src/modules/common/icons/esewa.tsx`

SVG icon component for eSewa logo

#### 7.2 Update Payment Provider Config

**File:** `edailo-storefront/src/lib/constants.tsx`

```typescript
export const isEsewa = (providerId?: string) => {
  return providerId?.startsWith("pp_esewa") ?? false
}

export const paymentInfoMap: Record<string, { title: string; icon: JSX.Element }> = {
  esewa: {
    title: "eSewa",
    icon: <Esewa />,
  },
  // ... other providers
}
```

---

## Files Created/Modified

### Backend Files

#### Created:
1. `edailo/src/modules/esewa-payment/index.ts` - Module registration
2. `edailo/src/modules/esewa-payment/service.ts` - Payment provider service
3. `edailo/src/api/esewa/verify/route.ts` - Verification endpoint
4. `edailo/src/api/middlewares.ts` - CORS middleware

#### Modified:
1. `edailo/medusa-config.ts` - Added payment provider configuration
2. `edailo/.env` - Added eSewa environment variables

### Frontend Files

#### Created:
1. `edailo-storefront/src/modules/common/icons/esewa.tsx` - eSewa icon

#### Modified:
1. `edailo-storefront/src/modules/checkout/components/payment-button/index.tsx` - Added eSewa payment button
2. `edailo-storefront/src/app/[countryCode]/(main)/order/page.tsx` - Added verification logic
3. `edailo-storefront/src/lib/constants.tsx` - Added eSewa configuration
4. `edailo-storefront/.env.local` - Added backend URL

---

## How It Works

### 1. Payment Initiation

**When:** Customer selects eSewa at checkout

**Backend Process:**
```typescript
initiatePayment() {
  1. Get cart amount (already in Rupees)
  2. Generate transaction UUID: cart_01JJ...-1769480784728
  3. Create payment data:
     - amount: "90"
     - total_amount: "90"
     - transaction_uuid: "cart_01JJ...-1769480784728"
     - product_code: "EPAYTEST"
  4. Generate signature:
     message = "total_amount=90,transaction_uuid=cart_...,product_code=EPAYTEST"
     signature = HMAC-SHA256(message, secret_key)
  5. Return payment session data
}
```

**Frontend Process:**
```typescript
handlePayment() {
  1. Store cart.id in localStorage
  2. Create HTML form with payment data
  3. Submit form to eSewa portal
  4. User redirected to eSewa
}
```

---

### 2. Payment on eSewa

**eSewa Portal:**
1. Customer enters phone number
2. Customer enters password
3. Customer enters OTP/MPIN
4. Payment processed
5. eSewa redirects back with base64 encoded response

**Redirect URL:**
```
http://localhost:8000/dk/order?data=eyJ0cmFuc2FjdGlvbl9jb2RlIjoiMDAwRFk...
```

**Response Data (decoded):**
```json
{
  "transaction_code": "000DY59",
  "status": "COMPLETE",
  "total_amount": "90.0",
  "transaction_uuid": "cart_01JJ...-1769480784728",
  "product_code": "EPAYTEST",
  "signed_field_names": "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
  "signature": "lnxO3BWS2D5aKY4bMfngZ8OxNkxGId4qqJ2lBitq4X8="
}
```

---

### 3. Payment Verification

**Frontend Process:**
```typescript
verifyPayment() {
  1. Decode base64 response from URL
  2. Extract payment data
  3. Get cart ID from localStorage
  4. Call backend verification API:
     POST /esewa/verify
     {
       transaction_code: "000DY59",
       transaction_uuid: "cart_01JJ...",
       cart_id: "cart_01JJ...",
       total_amount: "90.0",
       status: "COMPLETE",
       signature: "lnxO3BWS..."
     }
}
```

**Backend Verification Process:**
```typescript
POST /esewa/verify {
  1. Verify Signature:
     - Reconstruct message
     - Calculate expected signature
     - Compare with received signature
     ✅ Signature valid
  
  2. Check Status:
     - Ensure status === "COMPLETE"
     ✅ Payment complete
  
  3. Find Cart & Payment Session:
     - Query cart by ID
     - Find eSewa payment session
     - Verify transaction UUID matches
     ✅ Cart and session found
  
  4. Authorize Payment:
     - Call authorizePaymentSession()
     - Extract context from paymentSessionData.context
     - Call eSewa verification API
     - Return AUTHORIZED status
     ✅ Payment authorized
  
  5. Complete Payment Collection:
     - Call completePaymentCollections()
     - Marks payment as complete
     ✅ Payment collection complete
  
  6. Return Success:
     { success: true, payment: {...} }
}
```

---

### 4. Order Creation

**Frontend Process:**
```typescript
completeOrder() {
  1. Verification succeeded
  2. Call cart.complete(cartId)
  3. Medusa checks:
     - Payment session authorized? ✅
     - Payment collection complete? ✅
  4. Order created
  5. Redirect to confirmation page
}
```

---

## Testing

### Test Credentials (eSewa Test Environment)

```
Phone: 9806800001
Password: Nepal@123
MPIN: 1122
```

### Test Flow

1. **Start Servers:**
   ```bash
   # Backend
   cd edailo
   npm run dev
   
   # Frontend
   cd edailo-storefront
   npm run dev
   ```

2. **Test Payment:**
   - Go to http://localhost:8000/dk/store
   - Add product to cart
   - Go to checkout
   - Select eSewa payment
   - Click "Pay with eSewa"
   - Enter test credentials
   - Complete payment

3. **Verify Success:**
   - Check backend logs for ✅ symbols
   - Check frontend console for success messages
   - Verify order created in database
   - Check order confirmation page displays

### Expected Logs

**Backend:**
```
=== eSewa Verification Request ===
✅ Signature verified successfully
✅ Payment status is COMPLETE
✅ Cart found
✅ Payment session found
✅ Transaction UUID matches
✅ Payment session authorized
✅ Payment collection updated
=== Verification Complete ===
```

**Frontend:**
```javascript
eSewa Response: { transaction_code: "000DY59", status: "COMPLETE", ... }
Verification result: { success: true }
✅ Order created successfully: order_01JJ...
```

---

## Troubleshooting

### Common Issues

#### 1. "Cart not found"
**Cause:** Wrong cart ID stored in localStorage
**Solution:** 
- Always use `cart.id` (not `session.data.cart_id`)
- Clear localStorage and create new cart

#### 2. "Session was not authorized"
**Cause:** Payment collection not completed
**Solution:**
- Ensure `completePaymentCollections()` is called
- Check backend logs for authorization errors

#### 3. "Invalid signature"
**Cause:** Wrong secret key or signature format
**Solution:**
- Verify `ESEWA_SECRET_KEY` in .env
- Check signature message format matches eSewa docs

#### 4. "Cannot destructure property 'transaction_code'"
**Cause:** Context not extracted correctly
**Solution:**
- Extract from `paymentSessionData.context`
- Not from separate `context` parameter

#### 5. CORS errors
**Cause:** Middleware not loaded or backend not restarted
**Solution:**
- Restart backend after middleware changes
- Check `middlewares.ts` exists
- Verify STORE_CORS includes frontend URL

---

## Key Learnings

### 1. Amount Handling
- Medusa stores amounts in Rupees (not Paisa)
- eSewa expects Rupees
- No conversion needed - use amount directly

### 2. Context Parameter
- In Medusa v2, context is nested: `paymentSessionData.context`
- Not passed as separate parameter
- Must extract from correct location

### 3. Payment Authorization
- `authorizePaymentSession()` alone is not enough
- Must also call `completePaymentCollections()`
- Both required for `cart.complete()` to succeed

### 4. Signature Verification
- Critical for security
- Verify on both initiation and verification
- Use HMAC-SHA256 with base64 encoding

### 5. Cart ID Storage
- Always use `cart.id` (real Medusa cart ID)
- Format: `cart_01JJXXXXXX`
- Never use fallback IDs

---

## Next Steps

See **ESEWA_PRODUCTION_DEPLOYMENT.md** for:
- Production environment setup
- Real eSewa merchant account
- Security considerations
- Deployment checklist
- Monitoring and logging

---

**Integration Complete!** ✅

The eSewa payment gateway is now fully integrated with your Medusa e-commerce application.
