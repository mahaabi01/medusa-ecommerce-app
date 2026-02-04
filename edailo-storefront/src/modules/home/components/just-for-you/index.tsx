import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import { FeaturedSlider } from "./featured-slider"
import { ProductGridClient } from "./product-grid-client"
import { Suspense } from "react"

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default async function JustForYou({
  countryCode,
  region,
  limit = 4,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion
  limit?: number
}) {
  // Fetch ALL products to ensure we can show everything
  const {
    response: { products, count },
  } = await listProductsWithSort({
    page: 1,
    queryParams: {
      limit: 100, // Fetch all products (increase if you have more than 100)
    },
    sortBy: "created_at",
    countryCode,
  }).catch(() => ({
    response: { products: [], count: 0 },
    nextPage: null,
  }))

  // If no products, don't render the section
  if (!products || products.length < 9) {
    return null
  }

  // Shuffle all products for variety on each page refresh
  const shuffledProducts = shuffleArray(products)

  // Pick the first shuffled product as featured
  const featuredProduct = shuffledProducts[0]

  // Get 8 products for initial grid from the remaining shuffled products
  const initialGridProducts = shuffledProducts.slice(1, 9) // Get exactly 8 products for the 4×2 grid

  // Get remaining products for "Load More" (excluding the first 9)
  const remainingProducts = shuffledProducts.slice(9)

  // Calculate slider height to match 2 rows of cards
  // Card height: 286px, Gap: 16px
  // Total height: (2 × 286) + (1 × 16) = 572 + 16 = 588px
  const sliderHeight = 588

  return (
    <div className="bg-white">
      <div className="content-container py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-ui-fg-base">
            Just For You
          </h2>
        </div>

        <div className="mb-4">
          <ProductGridClient
            featuredProduct={featuredProduct}
            initialProducts={initialGridProducts}
            remainingProducts={remainingProducts}
            region={region}
            countryCode={countryCode}
          />
        </div>
      </div>
    </div>
  )
}
