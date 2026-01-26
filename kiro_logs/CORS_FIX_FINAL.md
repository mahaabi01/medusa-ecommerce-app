# CORS Issue - FINAL FIX ✅

## 🎯 Issue

**Error:** `Access to fetch at 'http://localhost:9000/esewa/verify' from origin 'http://localhost:8000' has been blocked by CORS policy`

**Root Cause:** Custom API routes in Medusa v2 need explicit CORS configuration

---

## ✅ Fixes Applied

### 1. Added OPTIONS Handler
**File:** `edailo/src/api/esewa/verify/route.ts`

Added OPTIONS method to handle CORS preflight requests:
```typescript
export async function OPTIONS(req, res) {
  res.status(204).end()
}
```

### 2. Created Middleware Configuration
**File:** `edailo/src/api/middlewares.ts` (NEW)

Added CORS middleware for all `/esewa/*` routes:
```typescript
{
  matcher: "/esewa/*",
  middlewares: [
    cors({
      origin: ["http://localhost:8000"],
      credentials: true
    })
  ]
}
```

---

## 🚀 CRITICAL: Restart Backend

```bash
cd edailo
npm run dev
```

**IMPORTANT:** You MUST restart for middleware changes to take effect!

---

## 🧪 Test CORS

### Test 1: Check OPTIONS Request
```bash
curl -X OPTIONS http://localhost:9000/esewa/verify \
  -H "Origin: http://localhost:8000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Should see:**
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: http://localhost:8000
< Access-Control-Allow-Credentials: true
```

### Test 2: Check POST Request
```bash
curl -X POST http://localhost:9000/esewa/verify \
  -H "Origin: http://localhost:8000" \
  -H "Content-Type: application/json" \
  -d '{"transaction_code":"test","transaction_uuid":"test","cart_id":"test"}' \
  -v
```

**Should see:**
```
< HTTP/1.1 404 Not Found (or 500, but NOT CORS error)
< Access-Control-Allow-Origin: http://localhost:8000
```

---

## ✅ Success Indicators

### 1. Backend Logs
```
✓ Middleware loaded
✓ CORS configured for /esewa/*
✓ No CORS errors
```

### 2. Browser Console
```
✓ No CORS error
✓ Request completes (even if 404/500)
✓ Response received
```

### 3. Network Tab
```
✓ OPTIONS request: 204 No Content
✓ POST request: 200 OK (or 404/500 with proper error)
✓ Access-Control-Allow-Origin header present
```

---

## 🔍 Debugging

### If Still Getting CORS Error

**Check 1: Backend Restarted?**
```bash
# Must restart after adding middleware
cd edailo
npm run dev
```

**Check 2: Middleware File Exists?**
```bash
# File should exist:
edailo/src/api/middlewares.ts
```

**Check 3: STORE_CORS in .env**
```bash
# Should include storefront URL
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
```

**Check 4: Check Response Headers**
```
Open DevTools → Network → esewa/verify
Look for:
- Access-Control-Allow-Origin: http://localhost:8000
- Access-Control-Allow-Credentials: true
```

---

## 📊 Request Flow

### 1. Browser Sends OPTIONS (Preflight)
```
OPTIONS http://localhost:9000/esewa/verify
Origin: http://localhost:8000
Access-Control-Request-Method: POST
```

### 2. Server Responds to OPTIONS
```
204 No Content
Access-Control-Allow-Origin: http://localhost:8000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: POST, OPTIONS
```

### 3. Browser Sends POST
```
POST http://localhost:9000/esewa/verify
Origin: http://localhost:8000
Content-Type: application/json
Body: {...}
```

### 4. Server Responds to POST
```
200 OK
Access-Control-Allow-Origin: http://localhost:8000
Content-Type: application/json
Body: {"success": true, ...}
```

---

## 🐛 Common Issues

### Issue: CORS error persists after restart
**Solution:** 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Try incognito mode

### Issue: OPTIONS returns 404
**Solution:**
- Check OPTIONS handler exists in route.ts
- Restart backend

### Issue: POST works but OPTIONS fails
**Solution:**
- Middleware not loaded
- Check middlewares.ts syntax
- Restart backend

### Issue: Different CORS error message
**Solution:**
- Check STORE_CORS includes http://localhost:8000
- Check no typos in URL
- Check port numbers match

---

## 📝 Files Modified

### 1. `edailo/src/api/esewa/verify/route.ts`
```typescript
// Added OPTIONS handler
export async function OPTIONS(req, res) {
  res.status(204).end()
}
```

### 2. `edailo/src/api/middlewares.ts` (NEW)
```typescript
// Added CORS middleware for /esewa/* routes
export default defineMiddlewares({
  routes: [{
    matcher: "/esewa/*",
    middlewares: [cors({...})]
  }]
})
```

---

## 🎯 Expected Result

After restart:

### Before (Error):
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
❌ Failed to fetch
❌ Payment verification fails
```

### After (Success):
```
✅ OPTIONS request: 204 No Content
✅ POST request: 200 OK
✅ Payment verified
✅ Order created
✅ Redirects to confirmation
```

---

## 🎉 Complete Flow

1. ✅ Payment successful on eSewa
2. ✅ Redirect to `/dk/order?data=...`
3. ✅ Decode eSewa response
4. ✅ **OPTIONS request to /esewa/verify** (CORS preflight)
5. ✅ **POST request to /esewa/verify** (Verification)
6. ✅ Backend verifies payment
7. ✅ Order created
8. ✅ Redirect to confirmation page

---

## 🚨 IMPORTANT

**You MUST restart the backend after adding the middleware file!**

```bash
cd edailo
# Stop with Ctrl+C
npm run dev
```

**Then test the complete flow again.**

---

**Restart backend and test! The CORS issue should be completely resolved.** 🚀
