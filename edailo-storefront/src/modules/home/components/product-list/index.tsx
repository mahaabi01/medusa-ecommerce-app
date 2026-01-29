import { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import { listProductsWithSort } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type ProductListProps = {
  countryCode: string
  limit?: number
  sortBy?: SortOptions
  title?: string
  showAll?: boolean
}

async function ProductListContent({
  countryCode,
  limit = 8,
  sortBy = "created_at",
}: Omit<ProductListProps, "title" | "showAll">) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProductsWithSort({
    page: 1,
    queryParams: {
      limit,
    },
    sortBy,
    countryCode,
  })

  if (!products || products.length === 0) {
    return null
  }

  return (
    <ul
      className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
      data-testid="home-products-list"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductPreview product={product} region={region} />
        </li>
      ))}
    </ul>
  )
}

export default function ProductList({
  countryCode,
  limit = 8,
  sortBy = "created_at",
  title = "Featured Products",
  showAll = true,
}: ProductListProps) {
  return (
    <div className="content-container py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl-semi" data-testid="home-products-title">
          {title}
        </h2>
        {showAll && (
          <a
            href={`/${countryCode}/store`}
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover txt-compact-medium"
          >
            View All →
          </a>
        )}
      </div>
      <Suspense fallback={<SkeletonProductGrid />}>
        <ProductListContent
          countryCode={countryCode}
          limit={limit}
          sortBy={sortBy}
        />
      </Suspense>
    </div>
  )
}
