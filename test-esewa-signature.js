// Test eSewa signature generation - Following official eSewa documentation
const crypto = require('crypto')

// Test data - adjust these values based on what you see in console
const productAmount = "100"  // Change this to match your cart total
const taxAmount = "0"
const serviceCharge = "0"
const deliveryCharge = "0"

// IMPORTANT: total_amount MUST equal amount + tax_amount + product_service_charge + product_delivery_charge
const totalAmount = (
  parseFloat(productAmount) + 
  parseFloat(taxAmount) + 
  parseFloat(serviceCharge) + 
  parseFloat(deliveryCharge)
).toString()

const testData = {
  amount: productAmount,
  tax_amount: taxAmount,
  product_service_charge: serviceCharge,
  product_delivery_charge: deliveryCharge,
  total_amount: totalAmount,
  transaction_uuid: "test-123456",
  product_code: "EPAYTEST"
}

const secretKey = "8gBm/:&EnhH.1/q"

// Generate signature exactly as eSewa expects
const message = `total_amount=${testData.total_amount},transaction_uuid=${testData.transaction_uuid},product_code=${testData.product_code}`

console.log("=== eSewa Signature Test (Official Format) ===")
console.log("Product Amount:", testData.amount)
console.log("Tax Amount:", testData.tax_amount)
console.log("Service Charge:", testData.product_service_charge)
console.log("Delivery Charge:", testData.product_delivery_charge)
console.log("Total Amount:", testData.total_amount)
console.log("Calculation:", `${testData.amount} + ${testData.tax_amount} + ${testData.product_service_charge} + ${testData.product_delivery_charge} = ${testData.total_amount}`)
console.log("\nMessage to sign:", message)
console.log("Secret Key:", secretKey)

const signature = crypto
  .createHmac('sha256', secretKey)
  .update(message)
  .digest('base64')

console.log("Generated Signature:", signature)
console.log("\n=== Complete Payment Data ===")
console.log(JSON.stringify({
  amount: testData.amount,
  tax_amount: testData.tax_amount,
  total_amount: testData.total_amount,
  transaction_uuid: testData.transaction_uuid,
  product_code: testData.product_code,
  product_service_charge: testData.product_service_charge,
  product_delivery_charge: testData.product_delivery_charge,
  signature: signature
}, null, 2))

console.log("\n=== Key Points from eSewa Documentation ===")
console.log("1. ALL parameters are required (no null or empty values)")
console.log("2. If tax/service/delivery charges are not used, set them to '0'")
console.log("3. total_amount = amount + tax_amount + product_service_charge + product_delivery_charge")
console.log("4. transaction_uuid: alphanumeric and hyphen(-) only")
console.log("5. Amount format: whole numbers (e.g., '100' not '100.00')")

console.log("\n=== Instructions ===")
console.log("1. Check your browser console for 'eSewa Payment Data'")
console.log("2. Verify total_amount equals the sum of all components")
console.log("3. All amounts should be strings without decimals")
console.log("4. Compare signature with what's being sent")
