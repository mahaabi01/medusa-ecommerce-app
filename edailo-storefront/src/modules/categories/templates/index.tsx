import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-3 content-container gap-6"
      data-testid="category-container"
    >
      {/* Left Sidebar - Sort Filter */}
      <div className="w-full small:w-56 flex-shrink-0">
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
      </div>

      {/* Main Content */}
      <div className="w-full flex-1">
        {/* Breadcrumb and Title */}
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
            {parents &&
              parents.reverse().map((parent) => (
                <span key={parent.id} className="flex items-center gap-2">
                  <LocalizedClientLink
                    className="hover:text-black transition-colors"
                    href={`/categories/${parent.handle}`}
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  <span>/</span>
                </span>
              ))}
          </div>
          <h1 className="text-lg font-bold" data-testid="category-page-title">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs text-gray-600 mt-1">{category.description}</p>
          )}
        </div>

        {/* Child Categories */}
        {category.category_children &&
          category.category_children.length > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Subcategories
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {category.category_children?.map((c) => (
                  <li key={c.id}>
                    <InteractiveLink
                      href={`/categories/${c.handle}`}
                      className="text-sm"
                    >
                      {c.name}
                    </InteractiveLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Products Grid */}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}