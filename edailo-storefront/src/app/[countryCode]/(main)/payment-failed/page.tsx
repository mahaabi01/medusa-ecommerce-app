"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error")

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            {error === "payment_failed"
              ? "Your payment could not be processed. Please try again."
              : "There was an issue processing your payment."}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            className="w-full"
            size="large"
          >
            Try Again
          </Button>
          
          <LocalizedClientLink href="/cart">
            <Button variant="secondary" className="w-full" size="large">
              Return to Cart
            </Button>
          </LocalizedClientLink>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <LocalizedClientLink
              href="/contact"
              className="text-blue-600 hover:text-blue-800"
            >
              Contact Support
            </LocalizedClientLink>
          </p>
        </div>
      </div>
    </div>
  )
}
