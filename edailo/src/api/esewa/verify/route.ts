import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { ModuleRegistrationName, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import crypto from "crypto"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const paymentModuleService: IPaymentModuleService = req.scope.resolve(
    ModuleRegistrationName.PAYMENT
  )
  
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { 
    transaction_code, 
    transaction_uuid, 
    cart_id,
    total_amount,
    status,
    signature 
  } = req.body as {
    transaction_code: string
    transaction_uuid: string
    cart_id: string
    total_amount: string
    status: string
    signature: string
  }

  console.log("=== eSewa Verification Request ===")
  console.log("Cart ID:", cart_id)
  console.log("Transaction UUID:", transaction_uuid)
  console.log("Transaction Code:", transaction_code)
  console.log("Status:", status)
  console.log("Total Amount:", total_amount)

  try {
    // Step 1: Verify the signature from eSewa
    const secretKey = process.env.ESEWA_SECRET_KEY
    if (!secretKey) {
      throw new Error("ESEWA_SECRET_KEY not configured")
    }

    const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_MERCHANT_ID},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names`
    
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64")

    console.log("Signature verification:")
    console.log("- Expected:", expectedSignature)
    console.log("- Received:", signature)
    console.log("- Match:", expectedSignature === signature)

    if (expectedSignature !== signature) {
      console.error("❌ Signature verification failed!")
      res.status(400).json({ 
        error: "Invalid signature",
        details: "Payment signature verification failed"
      })
      return
    }

    console.log("✅ Signature verified successfully")

    // Step 2: Check payment status
    if (status !== "COMPLETE") {
      console.error("❌ Payment status is not COMPLETE:", status)
      res.status(400).json({ 
        error: "Payment not completed",
        status 
      })
      return
    }

    console.log("✅ Payment status is COMPLETE")

    // Step 3: Query to get cart with payment collection
    console.log("Fetching cart from database...")
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "payment_collection.*", "payment_collection.payment_sessions.*"],
      filters: { id: cart_id }
    })

    const cart = carts[0]

    if (!cart) {
      console.error("❌ Cart not found:", cart_id)
      res.status(404).json({ error: "Cart not found" })
      return
    }

    console.log("✅ Cart found:", cart.id)

    if (!cart.payment_collection) {
      console.error("❌ Payment collection not found for cart:", cart_id)
      res.status(404).json({ error: "Payment collection not found" })
      return
    }

    console.log("✅ Payment collection found:", cart.payment_collection.id)

    // Step 4: Find eSewa payment session (check both pending and authorized status)
    const paymentSession = cart.payment_collection.payment_sessions?.find(
      (session: any) => {
        console.log("Checking session:", {
          id: session.id,
          provider_id: session.provider_id,
          status: session.status,
          amount: session.amount
        })
        return session.provider_id === "pp_esewa_esewa" && 
               (session.status === "pending" || session.status === "authorized")
      }
    )

    if (!paymentSession) {
      console.error("❌ eSewa payment session not found")
      console.log("Available sessions:", cart.payment_collection.payment_sessions?.map((s: any) => ({
        provider_id: s.provider_id,
        status: s.status
      })))
      res.status(404).json({ 
        error: "eSewa payment session not found",
        details: "No pending or authorized eSewa payment session found for this cart"
      })
      return
    }

    console.log("✅ Payment session found:", {
      id: paymentSession.id,
      status: paymentSession.status,
      amount: paymentSession.amount
    })

    // Step 5: Verify transaction UUID matches
    const sessionData = paymentSession.data as any
    if (sessionData.transaction_uuid !== transaction_uuid) {
      console.error("❌ Transaction UUID mismatch")
      console.log("- Session UUID:", sessionData.transaction_uuid)
      console.log("- eSewa UUID:", transaction_uuid)
      res.status(400).json({ 
        error: "Transaction UUID mismatch",
        details: "The transaction UUID does not match the payment session"
      })
      return
    }

    console.log("✅ Transaction UUID matches")

    // Step 6: Authorize the payment session
    console.log("Authorizing payment session...")
    
    try {
      const authorizedPayment = await paymentModuleService.authorizePaymentSession(
        paymentSession.id,
        {
          transaction_code,
          transaction_uuid,
        }
      )

      console.log("✅ Payment session authorized")
      console.log("Authorized payment ID:", authorizedPayment.id)
      
      // CRITICAL: After authorizing the payment session, mark the payment collection as complete
      // This is required for cart.complete() to work
      console.log("Completing payment collection...")
      
      await paymentModuleService.completePaymentCollections(
        cart.payment_collection.id
      )
      
      console.log("✅ Payment collection updated with authorized_amount:", cart.payment_collection.amount)
      console.log("=== Verification Complete ===")

      res.json({
        success: true,
        payment: authorizedPayment,
      })
    } catch (authError: any) {
      console.error("❌ Authorization failed:", authError.message)
      console.error("Error details:", authError)
      throw authError
    }
  } catch (error: any) {
    console.error("❌ eSewa verification error:", error)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    res.status(500).json({
      error: error.message || "Payment verification failed",
      details: error.toString()
    })
  }
}