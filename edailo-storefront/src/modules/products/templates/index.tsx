import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import ProductDescription from "@modules/products/templates/product-description"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container py-6 lg:py-12"
        data-testid="product-container"
      >
        {/* Main Product Section - Two Column Layout with max width and increased gap */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Left Column - Image Gallery (45% width) */}
            <div className="w-full lg:w-[45%]">
              <ImageGallery images={images} />
              
              {/* Product Description below image */}
              <div className="mt-8">
                <ProductDescription product={product} />
              </div>
            </div>

            {/* Right Column - Product Details (55% width with max constraint) */}
            <div className="w-full lg:w-[55%] flex flex-col gap-4 lg:max-w-md">
              {/* Product Title and Collection */}
              <ProductInfo product={product} />
              
              <ProductOnboardingCta />
              
              {/* Product Actions (Options, Price, Buttons) */}
              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                  />
                }
              >
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Product Tabs - Full Width Below */}
        <div className="mt-12 lg:mt-16 max-w-6xl mx-auto">
          <ProductTabs product={product} />
        </div>
      </div>
      
      {/* Related Products */}
      <div
        className="content-container my-8"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
