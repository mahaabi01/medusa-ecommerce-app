"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@medusajs/ui"
import Link from "next/link"

export default function TestEsewaSuccessPage() {
  const searchParams = useSearchParams()
  
  const data = {
    transaction_code: searchParams.get("transaction_code"),
    transaction_uuid: searchParams.get("transaction_uuid"),
    total_amount: searchParams.get("total_amount"),
    status: searchParams.get("status"),
    ref_id: searchParams.get("ref_id"),
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          ✅ Test Payment Successful!
        </h1>
        <p className="text-green-700">
          eSewa payment completed successfully. This confirms the integration is working.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment Details:</h2>
        <dl className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <dt className="font-medium">Transaction Code:</dt>
            <dd className="text-gray-600">{data.transaction_code || "N/A"}</dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="font-medium">Transaction UUID:</dt>
            <dd className="text-gray-600 text-sm">{data.transaction_uuid || "N/A"}</dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="font-medium">Amount:</dt>
            <dd className="text-gray-600">NPR {data.total_amount || "N/A"}</dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="font-medium">Status:</dt>
            <dd className="text-green-600 font-medium">{data.status || "N/A"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="font-medium">Reference ID:</dt>
            <dd className="text-gray-600">{data.ref_id || "N/A"}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-2">✅ What This Means:</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>eSewa integration is working correctly</li>
          <li>Signature generation is correct</li>
          <li>Payment form submission is correct</li>
          <li>The issue is likely in the Medusa checkout flow</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link href="/test-esewa">
          <Button variant="secondary" className="w-full">
            Test Another Payment
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full">
            Back to Store
          </Button>
        </Link>
      </div>
    </div>
  )
}
