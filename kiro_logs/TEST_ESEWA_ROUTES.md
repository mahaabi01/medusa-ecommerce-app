# eSewa Test Routes

## ✅ Correct Routes (With Country Code)

The test pages are now accessible with country code routing:

### Test Payment Page
```
http://localhost:8000/dk/test-esewa
http://localhost:8000/us/test-esewa
http://localhost:8000/[any-country-code]/test-esewa
```

### Success Page (After Payment)
```
http://localhost:8000/dk/test-esewa-success
http://localhost:8000/us/test-esewa-success
```

### Failure Page (If Payment Fails)
```
http://localhost:8000/dk/test-esewa-failure
http://localhost:8000/us/test-esewa-failure
```

---

## 📍 File Locations

The pages are now located at:

1. **Test Page:**
   ```
   edailo-storefront/src/app/[countryCode]/(main)/test-esewa/page.tsx
   ```

2. **Success Page:**
   ```
   edailo-storefront/src/app/[countryCode]/(main)/test-esewa-success/page.tsx
   ```

3. **Failure Page:**
   ```
   edailo-storefront/src/app/[countryCode]/(main)/test-esewa-failure/page.tsx
   ```

---

## 🚀 How to Test

### Step 1: Access Test Page

Open any of these URLs:
```
http://localhost:8000/dk/test-esewa
http://localhost:8000/us/test-esewa
```

### Step 2: Enter Amount

- Enter: **100**
- Click: "Test Payment with eSewa"

### Step 3: Complete Payment

Use test credentials:
- **eSewa ID:** 9806800001
- **Password:** Nepal@123
- **MPIN:** 1122

### Step 4: Verify Success

Should redirect to:
```
http://localhost:8000/dk/test-esewa-success
```

---

## 🎯 Why Country Code?

Your Medusa storefront uses country code routing:
- `/dk/` - Denmark
- `/us/` - United States
- `/[countryCode]/` - Any country

This is standard for multi-region Medusa storefronts.

---

## ✅ Quick Access

**For Denmark (dk):**
```
http://localhost:8000/dk/test-esewa
```

**For United States (us):**
```
http://localhost:8000/us/test-esewa
```

**Default (will redirect to your default region):**
```
http://localhost:8000/test-esewa
→ Redirects to: http://localhost:8000/dk/test-esewa
```

---

## 📝 Notes

- The storefront automatically adds the country code
- If you access `/test-esewa`, it redirects to `/dk/test-esewa`
- This is controlled by Next.js middleware
- All routes in your storefront follow this pattern

---

**Use:** `http://localhost:8000/dk/test-esewa` to test! 🚀
