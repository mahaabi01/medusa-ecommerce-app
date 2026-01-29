import { listProductsWithSort } from "@lib/data/products"
import { searchProducts } from "@lib/data/search"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  searchQuery,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  searchQuery?: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products
  let count

  // If search query exists, use search function
  if (searchQuery && searchQuery.trim().length > 0) {
    const searchResults = await searchProducts({
      query: searchQuery,
      countryCode,
      limit: 100, // Get more results for pagination
    })
    
    products = searchResults.products
    count = searchResults.count
    
    // Apply pagination to search results
    const startIndex = (page - 1) * PRODUCT_LIMIT
    const endIndex = startIndex + PRODUCT_LIMIT
    products = products.slice(startIndex, endIndex)
  } else {
    // Normal product listing
    const queryParams: PaginatedProductsParams = {
      limit: 12,
    }

    if (collectionId) {
      queryParams["collection_id"] = [collectionId]
    }

    if (categoryId) {
      queryParams["category_id"] = [categoryId]
    }

    if (productsIds) {
      queryParams["id"] = productsIds
    }

    if (sortBy === "created_at") {
      queryParams["order"] = "created_at"
    }

    const result = await listProductsWithSort({
      page,
      queryParams,
      sortBy,
      countryCode,
    })
    
    products = result.response.products
    count = result.response.count
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ui-fg-subtle text-lg">
          {searchQuery 
            ? `No products found for "${searchQuery}". Try different keywords.`
            : "No products found."}
        </p>
      </div>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
