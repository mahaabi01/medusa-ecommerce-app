import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService, ICartModuleService } from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const paymentModuleService: IPaymentModuleService = req.scope.resolve(
    ModuleRegistrationName.PAYMENT
  )
  const cartModuleService: ICartModuleService = req.scope.resolve(
    ModuleRegistrationName.CART
  )

  const { transaction_code, transaction_uuid, cart_id } = req.body

  try {
    // Get cart to find payment collection
    const cart = await cartModuleService.retrieveCart(cart_id, {
      relations: ["payment_collection"]
    })

    if (!cart.payment_collection) {
      res.status(404).json({ error: "Payment collection not found" })
      return
    }

    // Get payment sessions
    const paymentCollection = await paymentModuleService.retrievePaymentCollection(
      cart.payment_collection.id,
      { relations: ["payment_sessions"] }
    )

    const paymentSession = paymentCollection.payment_sessions?.find(
      (session) => session.provider_id === "pp_esewa_esewa"
    )

    if (!paymentSession) {
      res.status(404).json({ error: "eSewa payment session not found" })
      return
    }

    // Authorize the payment with transaction details
    const authorizedPayment = await paymentModuleService.authorizePaymentSession(
      paymentSession.id,
      {
        transaction_code,
        transaction_uuid,
      }
    )

    res.json({
      success: true,
      payment: authorizedPayment,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}