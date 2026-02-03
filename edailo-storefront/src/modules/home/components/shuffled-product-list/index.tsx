import { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import { listProductsWithSort } from "@lib/data/products"
import ProductCard from "@modules/home/components/product-card"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ShuffledProductListProps = {
  countryCode: string
  limit?: number
  title?: string
  subtitle?: string
  showAll?: boolean
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function ShuffledProductListContent({
  countryCode,
  limit = 12,
}: Omit<ShuffledProductListProps, "title" | "subtitle" | "showAll">) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Fetch more products than needed to ensure better shuffle variety
  const fetchLimit = Math.min(limit * 3, 50) // Fetch 3x the limit or max 50 products

  const {
    response: { products },
  } = await listProductsWithSort({
    page: 1,
    queryParams: {
      limit: fetchLimit,
    },
    sortBy: "created_at" as SortOptions,
    countryCode,
  })

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-ui-fg-subtle">
        <p>No products available at the moment.</p>
      </div>
    )
  }

  // Shuffle the products and take only the required limit
  const shuffledProducts = shuffleArray(products).slice(0, limit)

  return (
    <ul
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
      data-testid="shuffled-products-list"
    >
      {shuffledProducts.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} region={region} />
        </li>
      ))}
    </ul>
  )
}

export default function ShuffledProductList({
  countryCode,
  limit = 12,
  title = "Today's Best Deals",
  subtitle,
  showAll = true,
}: ShuffledProductListProps) {
  return (
    <section className="w-full py-3 md:py-4">
      <div className="content-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-3 md:mb-4 gap-3">
          <div className="space-y-1">
            <h2
              className="text-2xl md:text-3xl font-bold text-ui-fg-base"
              data-testid="shuffled-products-title"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm md:text-base text-ui-fg-subtle max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {showAll && (
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 text-sm md:text-base text-ui-fg-interactive hover:text-ui-fg-interactive-hover font-medium transition-colors group/link"
            >
              <span>View All</span>
              <svg
                className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </LocalizedClientLink>
          )}
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <ShuffledProductListContent countryCode={countryCode} limit={limit} />
        </Suspense>
      </div>
    </section>
  )
}
