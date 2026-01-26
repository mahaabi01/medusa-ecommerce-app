# Currency Conversion: Medusa ↔ eSewa

## 💰 Understanding the Conversion

### Medusa Storage
Medusa stores amounts in the **smallest currency unit**:
- **USD:** Cents (1 dollar = 100 cents)
- **NPR:** Paisa (1 rupee = 100 paisa)
- **EUR:** Cents (1 euro = 100 cents)

### eSewa Expectation
eSewa expects amounts in **Rupees** (not paisa):
- Amount: "100" = NPR 100
- Amount: "1000" = NPR 1000

---

## 🔄 The Conversion

### Example: NPR 100 Payment

**In Medusa:**
```
Cart Total: 10000 (paisa)
Currency: NPR
```

**Conversion:**
```javascript
medusa_amount = 10000  // paisa
esewa_amount = 10000 / 100 = 100  // rupees
esewa_amount_string = "100"
```

**Sent to eSewa:**
```json
{
  "amount": "100",
  "total_amount": "100"
}
```

---

## ✅ Current Implementation

### In `service.ts`:

```javascript
// Medusa amount is in paisa
const amount = 10000  // from Medusa

// Convert to rupees
const amountInRupees = Math.round(amount / 100)  // 100

// Convert to string for eSewa
const productAmount = amountInRupees.toString()  // "100"
```

### Logging:
```javascript
this.logger_.info("eSewa payment initiated:", {
  medusa_amount_paisa: 10000,
  esewa_amount_rupees: "100",
  conversion: "10000 paisa / 100 = 100 rupees"
})
```

---

## 🧪 Verification

### Test Page (Working):
```
Input: 100
Sent to eSewa: "100"
Result: ✅ Success
```

### Real Checkout (To Verify):
```
Medusa Cart: 10000 paisa
Converted: 100 rupees
Sent to eSewa: "100"
Result: ❓ Need to verify
```

---

## 🔍 How to Verify Conversion is Correct

### Step 1: Check Backend Logs

When you go through checkout, look for:
```
eSewa payment initiated: {
  medusa_amount_paisa: 10000,
  esewa_amount_rupees: "100",
  conversion: "10000 paisa / 100 = 100 rupees"
}
```

### Step 2: Check Browser Console

```javascript
eSewa Payment Data: {
  amount: "100",
  total_amount: "100"
}
```

### Step 3: Verify on eSewa Page

When redirected to eSewa:
- Amount shown should be: **NPR 100**
- NOT: NPR 10000
- NOT: NPR 1

---

## ⚠️ Potential Issues

### Issue 1: Wrong Currency

If your Medusa cart is in **USD** or **DKK**:
```
Cart: $100 USD = 10000 cents
Converted: 100 (wrong! should be ~13,000 NPR)
```

**Solution:** Use NPR currency in Medusa

### Issue 2: Already in Rupees

If Medusa is somehow storing amounts in rupees (not paisa):
```
Cart: 100 (already rupees)
Converted: 100 / 100 = 1 (wrong!)
```

**Solution:** Don't divide by 100

### Issue 3: Decimal Amounts

If cart has decimals:
```
Cart: 10050 paisa = 100.50 rupees
Converted: Math.round(10050 / 100) = 101 rupees
```

**This is correct** - eSewa doesn't support decimals

---

## 🎯 What to Check

### 1. Cart Currency

```javascript
// In Medusa Admin or API:
cart.currency_code  // Should be "npr"
```

### 2. Cart Total

```javascript
// In Medusa:
cart.total  // Should be in paisa (e.g., 10000)
```

### 3. eSewa Amount

```javascript
// In console:
amount: "100"  // Should be in rupees
```

### 4. eSewa Display

On eSewa payment page:
- Should show: **NPR 100**
- Should match your cart total

---

## 📊 Conversion Table

| Medusa (Paisa) | eSewa (Rupees) | Display |
|----------------|----------------|---------|
| 1000 | "10" | NPR 10 |
| 5000 | "50" | NPR 50 |
| 10000 | "100" | NPR 100 |
| 50000 | "500" | NPR 500 |
| 100000 | "1000" | NPR 1000 |

---

## ✅ Correct Flow

```
1. User adds NPR 100 product to cart
   → Medusa stores: 10000 paisa

2. User goes to checkout
   → Medusa sends: amount=10000, currency=NPR

3. Payment service converts
   → 10000 / 100 = 100 rupees

4. Sent to eSewa
   → amount="100", total_amount="100"

5. eSewa displays
   → NPR 100

6. User pays
   → NPR 100 deducted from eSewa account

7. Success!
   → Order created for NPR 100
```

---

## 🐛 If Conversion is Wrong

### Symptom: eSewa shows wrong amount

**Check:**
1. Backend log: What is `medusa_amount_paisa`?
2. Backend log: What is `esewa_amount_rupees`?
3. Console: What is `amount` being sent?
4. eSewa page: What amount is displayed?

**If amounts don't match:**
- Conversion is wrong
- Currency might be wrong
- Medusa might be storing amounts differently

---

## 🚀 Action Items

1. ✅ Restart backend (to get new logs)
2. ✅ Go through real checkout
3. ✅ Check backend logs for conversion
4. ✅ Check console for amount sent
5. ✅ Check eSewa page for amount displayed
6. ✅ Report back with all three values

---

**The conversion is: Medusa Paisa ÷ 100 = eSewa Rupees**

This is correct for NPR currency. If you're using a different currency, we need to adjust!
