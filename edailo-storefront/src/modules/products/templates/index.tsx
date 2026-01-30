import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductName from "@modules/products/templates/product-name"
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
        className="content-container flex flex-col lg:flex-row gap-6 py-6 relative"
        data-testid="product-container"
      >
        {/* Image Gallery - 75% width on desktop */}
        <div className="w-full lg:w-3/4">
          <ImageGallery images={images} />
          
          {/* Product Description below image */}
          <ProductDescription product={product} />
          
          {/* Product Tabs below description */}
          <div className="mt-8">
            <ProductTabs product={product} />
          </div>
        </div>

        {/* Product Details - 25% width on desktop */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          {/* Product Name only */}
          <ProductName product={product} />
          
          <ProductOnboardingCta />
          
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
      
      <div
        className="content-container my-16 small:my-32"
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
