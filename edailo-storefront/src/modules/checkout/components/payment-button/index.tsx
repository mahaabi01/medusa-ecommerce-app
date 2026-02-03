"use client"

import { isManual, isStripeLike, isEsewa } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { siteConfig } from "../../../../../config/siteConfig"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    case isEsewa(paymentSession?.provider_id):
      return (
        <EsewaPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>{siteConfig.chechout.selectPaymentMethod}</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        className="bg-green-900 hover:bg-green-700 ml-auto block"
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        {siteConfig.chechout.placeOrder}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        className="bg-green-900 hover:bg-green-700 ml-auto block mt-2"
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        {siteConfig.chechout.placeOrder}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

const EsewaPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending" && s.provider_id === "pp_esewa_esewa"
  )

  const handlePayment = () => {
    if (!session?.data) {
      setErrorMessage("Payment session not initialized")
      return
    }

    setSubmitting(true)

    // Debug: Log the entire session object
    console.log("=== Payment Session Debug ===")
    console.log("Full session:", session)
    console.log("Session data:", session.data)
    console.log("Session data keys:", Object.keys(session.data || {}))
    console.log("Session data values:", Object.values(session.data || {}))

    // CRITICAL: Always use cart.id (the actual Medusa cart ID)
    // Format: cart_01JJXXXXXX
    const cartIdToStore = cart.id
    
    if (!cartIdToStore) {
      console.error("❌ No cart ID available!")
      setErrorMessage("Cart ID not found")
      setSubmitting(false)
      return
    }
    
    localStorage.setItem("cart_id", cartIdToStore)
    console.log("✅ Stored cart ID in localStorage:", cartIdToStore)
    
    // Store country code - always use 'dk' for consistency
    localStorage.setItem("country_code", "dk")

    // Log payment data for debugging
    console.log("=== eSewa Payment Submission ===")
    console.log("Cart ID:", cartIdToStore)
    console.log("Amount:", session.data.amount)
    console.log("Total Amount:", session.data.total_amount)
    console.log("Transaction UUID:", session.data.transaction_uuid)
    console.log("Product Code:", session.data.product_code)
    console.log("Payment URL:", session.data.payment_url)
    console.log("Success URL:", session.data.success_url)

    // Check if session data is empty
    if (!session.data.amount || !session.data.total_amount || !session.data.transaction_uuid) {
      console.error("❌ Payment session data is incomplete!")
      console.error("This means the backend's initiatePayment failed or wasn't called")
      console.error("Check backend logs for errors")
      setErrorMessage("Payment session not properly initialized. Please refresh and try again.")
      setSubmitting(false)
      return
    }

    // Create and submit form to eSewa
    const form = document.createElement("form")
    form.method = "POST"
    form.action = session.data.payment_url as string

    const fields = {
      amount: session.data.amount,
      tax_amount: session.data.tax_amount,
      total_amount: session.data.total_amount,
      transaction_uuid: session.data.transaction_uuid,
      product_code: session.data.product_code,
      product_service_charge: session.data.product_service_charge,
      product_delivery_charge: session.data.product_delivery_charge,
      success_url: session.data.success_url,
      failure_url: session.data.failure_url,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: session.data.signature,
    }

    // Validate required fields
    const requiredFields = ['amount', 'total_amount', 'transaction_uuid', 'product_code', 'signature']
    const missingFields = requiredFields.filter(field => !fields[field as keyof typeof fields])
    
    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields)
      setErrorMessage(`Missing required fields: ${missingFields.join(', ')}`)
      setSubmitting(false)
      return
    }

    console.log("✅ All required fields present, submitting to eSewa...")

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
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="bg-success-primary hover:bg-success ml-auto block mt-2"
        data-testid={dataTestId}
      >
        Pay with eSewa
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="esewa-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
