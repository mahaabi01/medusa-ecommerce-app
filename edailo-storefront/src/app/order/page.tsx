"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function OrderConfirmedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionCode = searchParams.get("transaction_code")
      const transactionUuid = searchParams.get("transaction_uuid")
      const cartId = searchParams.get("cart_id") || localStorage.getItem("cart_id")

      if (!transactionCode || !transactionUuid || !cartId) {
        setError("Missing payment information")
        setLoading(false)
        return
      }

      try {
        // Verify payment with backend
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
          // Import SDK dynamically to avoid SSR issues
          const { sdk } = await import("@lib/config")
          
          // Complete the order - backend has already authorized the payment
          const order = await sdk.store.cart.complete(cartId)
          
          // Clear cart from localStorage
          localStorage.removeItem("cart_id")
          
          // Get country code from URL or default
          const countryCode = "us" // You can get this from the cart or region
          
          // Redirect to order confirmation
          router.push(`/${countryCode}/order/${order.id}/confirmed`)
        } else {
          setError("Payment verification failed")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verifying your payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Payment Error</h1>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return null
}