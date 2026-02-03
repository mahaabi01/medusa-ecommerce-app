import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import crypto from "crypto"

type EsewaOptions = {
  merchantId: string
  secretKey: string
  environment: "test" | "production"
}

export class EsewaPaymentService extends AbstractPaymentProvider<EsewaOptions> {
  static identifier = "esewa"
  protected logger_: Logger
  protected options_: EsewaOptions

  constructor(container: Record<string, unknown>, options: EsewaOptions) {
    super(container, options)
    this.logger_ = container.logger as Logger
    this.options_ = options
  }

  static validateOptions(options: Record<any, any>): void {
    if (!options.merchantId) {
      throw new Error("eSewa Merchant ID is required")
    }
    if (!options.secretKey) {
      throw new Error("eSewa Secret Key is required")
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const paymentSessionData = input.data || {}
    const status = paymentSessionData.status as string
    
    switch (status) {
      case "COMPLETE":
        return { status: PaymentSessionStatus.AUTHORIZED }
      case "PENDING":
        return { status: PaymentSessionStatus.PENDING }
      case "FAILED":
        return { status: PaymentSessionStatus.ERROR }
      case "CANCELED":
        return { status: PaymentSessionStatus.CANCELED }
      default:
        return { status: PaymentSessionStatus.PENDING }
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const {
      amount,
      currency_code,
      context: cart_context,
      email,
      resource_id,
    } = input as any

    try {
      // Log the context to debug
      console.log("=== eSewa initiatePayment ===")
      console.log("Amount:", amount)
      console.log("Currency:", currency_code)
      console.log("Resource ID:", resource_id)
      console.log("Email:", email)
      console.log("Cart context:", cart_context)

      // resource_id should be the cart ID, but we'll keep a fallback for safety
      // The payment button will use cart.id (the real ID) for localStorage
      const cartId = resource_id || `cart-${Date.now()}`
      console.log("Using cart ID for transaction UUID:", cartId)
      
      // Generate unique transaction UUID
      const transactionUuid = `${cartId}-${Date.now()}`
      
      // IMPORTANT: Medusa amount is already in the correct unit for eSewa
      // For NPR: Medusa stores in Rupees (not Paisa)
      // eSewa expects Rupees as well
      // So NO conversion needed - use amount directly
      const amountInRupees = Math.round(amount)
      
      // eSewa requires: total_amount = amount + tax_amount + product_service_charge + product_delivery_charge
      // Since we're not breaking down the amount, we put everything in 'amount' and set others to 0
      const productAmount = amountInRupees.toString()
      const taxAmount = "0"
      const serviceCharge = "0"
      const deliveryCharge = "0"
      const totalAmount = amountInRupees.toString()

      // Get country code - use 'dk' as default since that's your main region
      const countryCode = 'np'

      // Create payment data - ALL fields are required by eSewa
      const paymentData = {
        amount: productAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: this.options_.merchantId,
        product_service_charge: serviceCharge,
        product_delivery_charge: deliveryCharge,
        // eSewa will append ?data=base64_encoded_response to this URL
        success_url: `${process.env.STOREFRONT_URL}/${countryCode}/order`,
        failure_url: `${process.env.STOREFRONT_URL}/${countryCode}/payment-failed?error=payment_failed`,
      }

      // Generate signature using the exact format from eSewa docs
      const signature = this.generateSignature(paymentData)

      console.log("eSewa payment data created:")
      console.log("- Transaction UUID:", transactionUuid)
      console.log("- Total Amount:", totalAmount)
      console.log("- Product Code:", this.options_.merchantId)
      console.log("- Signature:", signature)

      return {
        id: transactionUuid,
        data: {
          ...paymentData,
          signature,
          status: "PENDING",
          payment_url: this.getPaymentUrl(),
          cart_id: cartId, // Store cart_id for reference (but payment button will use cart.id)
        },
      }
    } catch (error: any) {
      console.error("❌ eSewa initiate payment error:", error)
      throw error
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    try {
      console.log("=== eSewa authorizePayment called ===")
      console.log("Input:", input)

      const paymentSessionData = input.data || {}
      const context = input.context || {}

      // CRITICAL FIX: In Medusa v2, the context is nested inside paymentSessionData
      // Extract it from the correct location
      const actualContext = (paymentSessionData.context as Record<string, unknown>) || context || {}
      const { transaction_code, transaction_uuid } = actualContext

      console.log("Extracted context:", actualContext)
      console.log("Transaction code:", transaction_code)
      console.log("Transaction UUID:", transaction_uuid)

      if (!transaction_code || !transaction_uuid) {
        console.error("❌ Missing transaction_code or transaction_uuid")
        // Return error status with data
        return {
          status: PaymentSessionStatus.ERROR,
          data: {
            ...paymentSessionData,
            status: "ERROR",
            error: "Missing transaction details",
          },
        }
      }

      console.log("Verifying payment with eSewa API...")
      console.log("- Transaction Code:", transaction_code)
      console.log("- Transaction UUID:", transaction_uuid)
      
      // Get total_amount from the data object
      const totalAmount = paymentSessionData.total_amount as string

      console.log("- Total Amount:", totalAmount)

      // Verify payment with eSewa
      const verificationResult = await this.verifyPayment(
        transaction_code as string,
        transaction_uuid as string,
        totalAmount
      )

      console.log("eSewa verification result:", verificationResult)

      if (verificationResult.verified) {
        console.log("✅ Payment verified successfully with eSewa")
        
        return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: {
            ...paymentSessionData,
            status: "COMPLETE",
            transaction_code,
            verified_at: new Date().toISOString(),
            esewa_verification_data: verificationResult.data,
          },
        }
      }

      console.error("❌ Payment verification failed")
      console.error("Verification result:", verificationResult)
      
      // Return error status with data
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...paymentSessionData,
          status: "ERROR",
          error: "Payment verification failed with eSewa",
          verification_result: verificationResult,
        },
      }
    } catch (error: any) {
      console.error("❌ eSewa authorize payment error:", error)
      // Return error status with data
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          status: "ERROR",
          error: error.message || "Authorization failed",
        },
      }
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    // eSewa doesn't have separate capture - it's captured on authorization
    return { data: input.data || {} }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    // Note: eSewa refunds are typically handled manually through merchant portal
    // This is a placeholder for refund logic
    this.logger_.warn(
      "eSewa refunds must be processed manually through the merchant portal"
    )
    
    return {
      data: {
        ...(input.data || {}),
        refund_amount: input.amount,
        refund_requested_at: new Date().toISOString(),
      },
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        status: "CANCELED",
        canceled_at: new Date().toISOString(),
      },
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data || {} }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data || {} }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    const result = await this.initiatePayment(input as InitiatePaymentInput)
    return { data: result.data }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    // eSewa doesn't use webhooks in the traditional sense
    // Payment verification happens on redirect
    return {
      action: "not_supported",
    }
  }

  // Helper methods
  private generateSignature(data: any): string {
    const message = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${this.options_.merchantId}`
    
    const hash = crypto
      .createHmac("sha256", this.options_.secretKey)
      .update(message)
      .digest("base64")
    
    return hash
  }

  private getPaymentUrl(): string {
    return this.options_.environment === "production"
      ? "https://epay.esewa.com.np/api/epay/main/v2/form"
      : "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
  }

  private async verifyPayment(
    transactionCode: string,
    transactionUuid: string,
    totalAmount: string
  ): Promise<{ verified: boolean; data?: any; error?: string }> {
    try {
      const verificationUrl = this.options_.environment === "production"
        ? "https://epay.esewa.com.np/api/epay/transaction/status"
        : "https://rc-epay.esewa.com.np/api/epay/transaction/status"

      const verificationData = {
        product_code: this.options_.merchantId,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
      }

      const queryString = `product_code=${verificationData.product_code}&total_amount=${verificationData.total_amount}&transaction_uuid=${verificationData.transaction_uuid}`
      const fullUrl = `${verificationUrl}?${queryString}`

      console.log("=== Calling eSewa Verification API ===")
      console.log("URL:", fullUrl)
      console.log("Parameters:", verificationData)

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("eSewa API Response Status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ eSewa API Error Response:", errorText)
        return { 
          verified: false, 
          error: `eSewa API returned ${response.status}: ${errorText}` 
        }
      }

      const result = await response.json()
      console.log("eSewa API Response Data:", result)

      // Check if payment is complete and UUID matches
      if (result.status === "COMPLETE" && result.transaction_uuid === transactionUuid) {
        console.log("✅ eSewa verification successful")
        return { verified: true, data: result }
      }

      console.error("❌ eSewa verification failed - status or UUID mismatch")
      console.error("Expected UUID:", transactionUuid)
      console.error("Received UUID:", result.transaction_uuid)
      console.error("Status:", result.status)

      return { 
        verified: false, 
        data: result,
        error: `Status: ${result.status}, UUID match: ${result.transaction_uuid === transactionUuid}`
      }
    } catch (error) {
      console.error("❌ eSewa verification API error:", error)
      return { 
        verified: false, 
        error: error.message || "Network error calling eSewa API" 
      }
    }
  }
}