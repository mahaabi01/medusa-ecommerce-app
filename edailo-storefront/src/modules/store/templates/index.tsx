import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import { siteConfig } from "../../../../config/siteConfig"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  searchQuery,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  searchQuery?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8">
          {searchQuery ? (
            <div>
              <h1 className="text-2xl-semi" data-testid="store-page-title">
                Search Results for "{searchQuery}"
              </h1>
              <p className="text-base-regular text-ui-fg-subtle mt-2">
                Showing products matching your search
              </p>
            </div>
          ) : (
            <h1 className="text-2xl-semi" data-testid="store-page-title">
              {siteConfig.product.allProduct}
            </h1>
          )}
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
