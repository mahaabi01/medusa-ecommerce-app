"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"

export default function OrderVerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      // eSewa sends response as base64 encoded 'data' parameter
      const encodedData = searchParams.get("data")
      
      if (!encodedData) {
        setError("No payment data received from eSewa")
        setLoading(false)
        return
      }

      try {
        // Decode the base64 data
        const decodedData = JSON.parse(atob(encodedData))
        
        console.log("eSewa Response:", decodedData)

        const {
          transaction_code,
          transaction_uuid,
          status,
          total_amount,
          signature
        } = decodedData

        // Check if payment was successful
        if (status !== "COMPLETE") {
          router.push(`/${countryCode}/payment-failed?error=payment_${status.toLowerCase()}`)
          return
        }

        // Get cart ID from localStorage
        const cartId = localStorage.getItem("cart_id")

        if (!cartId) {
          setError("Cart ID not found. Please contact support.")
          setLoading(false)
          return
        }

        console.log("Verifying payment with backend...")
        console.log("- Cart ID:", cartId)
        console.log("- Transaction UUID:", transaction_uuid)
        console.log("- Transaction Code:", transaction_code)
        console.log("- Status:", status)
        console.log("- Total Amount:", total_amount)

        // Verify payment with backend - send ALL data from eSewa
        const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/esewa/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_code,
            transaction_uuid,
            cart_id: cartId,
            total_amount,
            status,
            signature, // Important: Send signature for verification
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Verification failed:", errorData)
          throw new Error(errorData.error || "Payment verification failed")
        }

        const result = await response.json()
        console.log("Verification result:", result)

        if (result.success) {
          console.log("Payment verified successfully, completing order...")
          
          // Import SDK dynamically to avoid SSR issues
          const { sdk } = await import("@lib/config")
          
          // Complete the order - backend has already authorized the payment
          const orderResponse = await sdk.store.cart.complete(cartId)
          
          console.log("Order completion response:", orderResponse)
          
          // Clear cart from localStorage
          localStorage.removeItem("cart_id")
          
          // Check if order was created successfully
          if (orderResponse.type === "order" && orderResponse.order) {
            console.log("✅ Order created successfully:", orderResponse.order.id)
            // Redirect to order confirmation
            router.push(`/${countryCode}/order/${orderResponse.order.id}/confirmed`)
          } else if (orderResponse.type === "cart") {
            // Cart still exists, order not created
            console.error("❌ Order creation failed - cart still exists")
            setError("Order creation failed. Please contact support.")
          }
        } else {
          setError("Payment verification failed")
        }
      } catch (err) {
        console.error("Payment verification error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, router, countryCode])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Error</h1>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.push(`/${countryCode}/checkout`)}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Return to Checkout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
