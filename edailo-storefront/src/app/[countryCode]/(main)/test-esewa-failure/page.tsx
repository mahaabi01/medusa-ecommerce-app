"use client"

import { Button } from "@medusajs/ui"
import Link from "next/link"

export default function TestEsewaFailurePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-red-800 mb-2">
          ❌ Test Payment Failed
        </h1>
        <p className="text-red-700">
          The payment was cancelled or failed on eSewa.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/test-esewa">
          <Button className="w-full">
            Try Again
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" className="w-full">
            Back to Store
          </Button>
        </Link>
      </div>
    </div>
  )
}
