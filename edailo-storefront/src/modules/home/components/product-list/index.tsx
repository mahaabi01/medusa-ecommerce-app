import { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import { listProductsWithSort } from "@lib/data/products"
import ProductCard from "@modules/home/components/product-card"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductListProps = {
  countryCode: string
  limit?: number
  sortBy?: SortOptions
  title?: string
  subtitle?: string
  showAll?: boolean
  type?: "latest" | "deals" | "featured"
}

async function ProductListContent({
  countryCode,
  limit = 12,
  sortBy = "created_at",
  type = "featured",
}: Omit<ProductListProps, "title" | "subtitle" | "showAll">) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Prepare query params based on type
  const queryParams: any = {
    limit,
  }

  // For deals, we can filter by tags or metadata
  // You can customize this based on your product structure
  if (type === "deals") {
    // Example: Filter products with a "deal" tag or discount metadata
    // queryParams.tags = ["deal", "sale", "discount"]
    // For now, we'll just use price sorting to show best deals
    sortBy = "price_asc"
  }

  // For latest products, sort by created_at (newest first)
  if (type === "latest") {
    sortBy = "created_at"
  }

  const {
    response: { products },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy,
    countryCode,
  })

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-ui-fg-subtle">
        <p>No products available at the moment.</p>
      </div>
    )
  }

  return (
    <ul
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
      data-testid="home-products-list"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} region={region} />
        </li>
      ))}
    </ul>
  )
}

export default function ProductList({
  countryCode,
  limit = 12,
  sortBy = "created_at",
  title = "Featured Products",
  subtitle,
  showAll = true,
  type = "featured",
}: ProductListProps) {
  return (
    <section className="w-full py-6 md:py-8">
      <div className="content-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 md:mb-8 gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-ui-fg-base" data-testid="home-products-title">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </LocalizedClientLink>
          )}
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <ProductListContent
            countryCode={countryCode}
            limit={limit}
            sortBy={sortBy}
            type={type}
          />
        </Suspense>
      </div>
    </section>
  )
}
