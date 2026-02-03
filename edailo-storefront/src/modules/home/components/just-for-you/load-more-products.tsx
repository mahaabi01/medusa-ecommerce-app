"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import ProductCardClient from "./product-card-client"
import { loadMoreJustForYouProducts } from "./actions"

export function LoadMoreProducts({
  countryCode,
  region,
  initialPage = 2,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion
  initialPage?: number
}) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    setLoading(true)
    console.log(`Load More clicked - Current page: ${currentPage}`)
    try {
      const { products: newProducts, hasMore: moreAvailable } = await loadMoreJustForYouProducts(
        countryCode,
        currentPage
      )

      console.log(`Received ${newProducts?.length} products, hasMore: ${moreAvailable}`)

      if (newProducts && newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts])
        setCurrentPage((prev) => prev + 1)
        setHasMore(moreAvailable)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more products:", error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {products.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCardClient product={product} region={region} />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "LOAD MORE"}
          </button>
        </div>
      )}
    </>
  )
}
