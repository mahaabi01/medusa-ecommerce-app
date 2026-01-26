"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"

export default function TestEsewaPage() {
  const [amount, setAmount] = useState("100")
  const [loading, setLoading] = useState(false)

  const testPayment = () => {
    setLoading(true)

    const crypto = require('crypto')
    
    // Test data - following eSewa documentation exactly
    const transactionUuid = `test-${Date.now()}`
    const productAmount = amount
    const taxAmount = "0"
    const serviceCharge = "0"
    const deliveryCharge = "0"
    // total_amount MUST equal amount + tax_amount + product_service_charge + product_delivery_charge
    const totalAmount = (
      parseFloat(productAmount) + 
      parseFloat(taxAmount) + 
      parseFloat(serviceCharge) + 
      parseFloat(deliveryCharge)
    ).toString()
    
    const productCode = "EPAYTEST"
    const secretKey = "8gBm/:&EnhH.1/q"

    // Generate signature - exactly as per eSewa docs
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64')

    console.log("Test Payment Data:", {
      amount: productAmount,
      tax_amount: taxAmount,
      product_service_charge: serviceCharge,
      product_delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      calculation: `${productAmount} + ${taxAmount} + ${serviceCharge} + ${deliveryCharge} = ${totalAmount}`,
      message,
      signature,
      transactionUuid
    })

    // Create form - ALL fields are required by eSewa
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"

    const fields = {
      amount: productAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: serviceCharge,
      product_delivery_charge: deliveryCharge,
      success_url: `${window.location.origin}/test-esewa-success`,
      failure_url: `${window.location.origin}/test-esewa-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    }

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = String(value)
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Test eSewa Payment</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a test page to verify eSewa integration directly.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount (NPR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter amount"
          />
          <p className="text-xs text-gray-500 mt-1">
            Try: 10, 100, or 1000
          </p>
        </div>

        <div className="bg-gray-50 rounded p-4 text-sm">
          <h3 className="font-medium mb-2">Test Credentials:</h3>
          <ul className="space-y-1 text-gray-600">
            <li>eSewa ID: 9806800001</li>
            <li>Password: Nepal@123</li>
            <li>MPIN: 1122</li>
          </ul>
        </div>

        <Button
          onClick={testPayment}
          isLoading={loading}
          className="w-full"
          size="large"
        >
          Test Payment with eSewa
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
          <h3 className="font-medium mb-2">What this tests:</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Signature generation</li>
            <li>Form submission to eSewa</li>
            <li>Payment flow without Medusa</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
