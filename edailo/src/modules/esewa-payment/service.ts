import {
  AbstractPaymentProvider,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import crypto from "crypto"

type EsewaOptions = {
  merchantId: string
  secretKey: string
  environment: "test" | "production"
}

type PaymentIntentDataByStatus = {
  [key: string]: {
    session_data: Record<string, unknown>
  }
}

export class EsewaPaymentService extends AbstractPaymentProvider<EsewaOptions> {
  static identifier = "esewa"
  protected logger_: Logger
  protected options_: EsewaOptions

  constructor({ logger }, options: EsewaOptions) {
    super(...arguments)
    this.logger_ = logger
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
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    const status = paymentSessionData.status as string
    
    switch (status) {
      case "COMPLETE":
        return PaymentSessionStatus.AUTHORIZED
      case "PENDING":
        return PaymentSessionStatus.PENDING
      case "FAILED":
        return PaymentSessionStatus.ERROR
      case "CANCELED":
        return PaymentSessionStatus.CANCELED
      default:
        return PaymentSessionStatus.PENDING
    }
  }

  async initiatePayment(
    context: any
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const {
      amount,
      currency_code,
      context: cart_context,
      email,
      resource_id,
    } = context

    try {
      // Generate unique transaction UUID
      const transactionUuid = `${resource_id}-${Date.now()}`
      
      // Calculate total amount in paisa (eSewa uses paisa, not rupees)
      const totalAmount = (amount / 100).toFixed(2)

      // Create payment data
      const paymentData = {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: this.options_.merchantId,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: cart_context.success_url || `${process.env.STOREFRONT_URL}/order?transaction_uuid=${transactionUuid}&cart_id=${resource_id}`,
        failure_url: cart_context.failure_url || `${process.env.STOREFRONT_URL}/checkout?error=payment_failed`,
      }

      // Generate signature
      const signature = this.generateSignature(paymentData)

      return {
        data: {
          ...paymentData,
          signature,
          status: "PENDING",
          payment_url: this.getPaymentUrl(),
        },
      }
    } catch (error) {
      return {
        error: error.message,
        code: "esewa_initiate_error",
        detail: error,
      }
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    PaymentProviderError | {
      status: PaymentSessionStatus
      data: PaymentProviderSessionResponse["data"]
    }
  > {
    try {
      const { transaction_code, transaction_uuid } = context

      // Verify payment with eSewa
      const verificationResult = await this.verifyPayment(
        transaction_code as string,
        transaction_uuid as string,
        paymentSessionData.total_amount as string
      )

      if (verificationResult.verified) {
        return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: {
            ...paymentSessionData,
            status: "COMPLETE",
            transaction_code,
            verified_at: new Date().toISOString(),
          },
        }
      }

      return {
        error: "Payment verification failed",
        code: "esewa_verification_failed",
        detail: verificationResult,
      }
    } catch (error) {
      return {
        error: error.message,
        code: "esewa_authorize_error",
        detail: error,
      }
    }
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    // eSewa doesn't have separate capture - it's captured on authorization
    return paymentSessionData
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    // Note: eSewa refunds are typically handled manually through merchant portal
    // This is a placeholder for refund logic
    this.logger_.warn(
      "eSewa refunds must be processed manually through the merchant portal"
    )
    
    return {
      ...paymentSessionData,
      refund_amount: refundAmount,
      refund_requested_at: new Date().toISOString(),
    }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return {
      ...paymentSessionData,
      status: "CANCELED",
      canceled_at: new Date().toISOString(),
    }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return paymentSessionData
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return paymentSessionData
  }

  async updatePayment(
    context: any
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return this.initiatePayment(context)
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
  ): Promise<{ verified: boolean; data?: any }> {
    try {
      const verificationUrl = this.options_.environment === "production"
        ? "https://epay.esewa.com.np/api/epay/transaction/status"
        : "https://rc-epay.esewa.com.np/api/epay/transaction/status"

      const verificationData = {
        product_code: this.options_.merchantId,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
      }

      const response = await fetch(
        `${verificationUrl}?product_code=${verificationData.product_code}&total_amount=${verificationData.total_amount}&transaction_uuid=${verificationData.transaction_uuid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const result = await response.json()

      if (result.status === "COMPLETE" && result.transaction_uuid === transactionUuid) {
        return { verified: true, data: result }
      }

      return { verified: false, data: result }
    } catch (error) {
      this.logger_.error("eSewa verification error:", error)
      return { verified: false }
    }
  }
}