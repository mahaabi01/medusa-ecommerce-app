import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"
import { siteConfig } from "../../../../config/siteConfig"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  searchQuery,
  categoryId,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  searchQuery?: string
  categoryId?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Fetch categories for the filter
  const categories = await listCategories({ limit: 50 })

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-3 content-container gap-6"
      data-testid="category-container"
    >
      {/* Left Sidebar - Filters (Reduced width) */}
      <div className="w-full small:w-56 flex-shrink-0 space-y-4">
        {/* Category Filter */}
        <CategoryFilter categories={categories} />
        
        {/* Sort Filter */}
        <RefinementList sortBy={sort} />
      </div>

      {/* Main Content */}
      <div className="w-full flex-1">
        {/* Title */}
        <div className="mb-3">
          {searchQuery ? (
            <div>
              <h1 className="text-lg font-bold" data-testid="store-page-title">
             {siteConfig.product.search} "{searchQuery}"
              </h1>
              <p className="text-xs text-ui-fg-subtle mt-0.5">
                {siteConfig.product.matching}
              </p>
            </div>
          ) : (
            <h1 className="text-lg font-bold" data-testid="store-page-title">
              {siteConfig.product.allProduct}
            </h1>
          )}
        </div>

        {/* Products Grid */}
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            searchQuery={searchQuery}
            categoryId={categoryId}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
