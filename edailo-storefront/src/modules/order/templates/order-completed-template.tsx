import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import { siteConfig } from "../../../../config/siteConfig"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <div className="content-container h-full w-full px-4">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="grid grid-cols-2 gap-4 h-full w-full py-4"
          data-testid="order-complete-container"
        >
          {/* Left Column - Order Summary */}
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Success Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <Heading level="h1" className="text-xl font-bold text-gray-900 mb-1">
                    {siteConfig.order.thankYou}
                  </Heading>
                  <p className="text-sm text-gray-600">{siteConfig.order.orderSucess}</p>
                </div>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <OrderDetails order={order} />
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <Heading level="h2" className="text-base font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                {siteConfig.cart.summary}
              </Heading>
              <Items order={order} />
              <div className="mt-3 pt-3 border-t border-gray-200">
                <CartTotals totals={order} />
              </div>
            </div>
          </div>

          {/* Right Column - Shipping & Payment */}
          <div className="flex flex-col gap-3 overflow-y-auto pl-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Shipping Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ShippingDetails order={order} />
            </div>

            {/* Payment Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <PaymentDetails order={order} />
            </div>

            {/* Help Section Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <Help />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
