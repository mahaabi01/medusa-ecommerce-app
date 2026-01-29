import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import ProductCard from "@modules/home/components/product-card"
import { FeaturedSlider } from "./featured-slider"
import { Suspense } from "react"

export default async function JustForYou({
  countryCode,
  region,
  limit = 8,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion
  limit?: number
}) {
  // Fetch products for the section (include countryCode for pricing/availability)
  const { response } = await listProducts({
    queryParams: {
      limit: limit + 1, // +1 for featured product
      fields: "id,title,handle,thumbnail,images,variants,prices,description",
      country_code: countryCode,
    },
  }).catch(() => ({ response: { products: [], count: 0 } }))

  const products = response?.products || []

  if (!products || products.length === 0) {
    return null
  }

  // Pick a random featured product on each server render (changes on refresh)
  const featuredIndex = Math.floor(Math.random() * products.length)
  const featuredProduct = products[featuredIndex]
  const gridProducts = products.filter((_, i) => i !== featuredIndex).slice(0, limit)

  return (
    <div className="bg-ui-bg-base">
      <div className="content-container py-12">
        <h2 className="text-2xl font-bold mb-8 text-ui-fg-base">Just For You</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Featured Product Slider (large) */}
          <div className="lg:col-span-6">
            <Suspense fallback={<div className="bg-gray-200 h-96 rounded-lg" />}>
              <FeaturedSlider product={featuredProduct} />
            </Suspense>
          </div>

          {/* RIGHT: Product Grid (4 columns, 2 rows = 8 items) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {gridProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  region={region}
                  compact={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
