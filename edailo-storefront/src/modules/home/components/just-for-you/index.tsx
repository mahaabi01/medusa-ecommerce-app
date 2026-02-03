import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import ProductCard from "@modules/home/components/product-card"
import { FeaturedSlider } from "./featured-slider"
import { LoadMoreProducts } from "./load-more-products"
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
  // Fetch more products for better shuffle variety
  const {
    response: { products },
  } = await listProductsWithSort({
    page: 1,
    queryParams: {
      limit: 30, // Fetch more products for better variety (3x the needed amount)
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

  // Get 8 products for grid from the remaining shuffled products
  const gridProducts = shuffledProducts.slice(1, 9) // Get exactly 8 products for the 4×2 grid

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

        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT: Featured Product Card (Large) - Fixed height to match 2 rows */}
          <div className="flex-1">
            <Suspense
              fallback={
                <div
                  className="bg-gray-200 rounded-lg animate-pulse"
                  style={{ height: `${sliderHeight}px` }}
                />
              }
            >
              <FeaturedSlider
                product={featuredProduct}
                countryCode={countryCode}
                height={sliderHeight}
              />
            </Suspense>
          </div>

          {/* RIGHT: Product Grid (4×2 = 8 cards) - Fixed width: (4 × 192) + (3 × 16) = 816px */}
          <div className="w-full lg:w-[816px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gridProducts.map((product) => (
                <div key={product.id} className="w-[192px] h-[286px]">
                  <ProductCard product={product} region={region} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Load More Section */}
        <LoadMoreProducts
          countryCode={countryCode}
          region={region}
          initialPage={2}
        />
      </div>
    </div>
  )
}
