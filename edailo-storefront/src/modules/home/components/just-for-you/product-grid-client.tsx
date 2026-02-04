"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import ProductCardClient from "./product-card-client"
import { FeaturedSlider } from "./featured-slider"

export function ProductGridClient({
  featuredProduct,
  initialProducts,
  remainingProducts,
  region,
  countryCode,
}: {
  featuredProduct: HttpTypes.StoreProduct
  initialProducts: HttpTypes.StoreProduct[]
  remainingProducts: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const [displayedProducts, setDisplayedProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const productsPerLoad = 12 // Load 12 products at a time
  const hasMore = currentIndex < remainingProducts.length

  const loadMore = async () => {
    setLoading(true)
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Get next batch of products
    const nextBatch = remainingProducts.slice(currentIndex, currentIndex + productsPerLoad)
    
    console.log(`Loading products ${currentIndex} to ${currentIndex + nextBatch.length} of ${remainingProducts.length} remaining`)
    
    // Add new products to the existing grid
    setDisplayedProducts((prev) => [...prev, ...nextBatch])
    setCurrentIndex((prev) => prev + nextBatch.length)
    setLoading(false)
  }

  return (
    <>
      {/* Unified Grid with Featured Product taking 2x2 space */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Featured Product - Takes 2 columns × 2 rows */}
        <div className="col-span-2 row-span-2">
          <FeaturedSlider
            product={featuredProduct}
            countryCode={countryCode}
            height={null} // Let it size naturally to match 2 rows
          />
        </div>

        {/* Regular Products */}
        {displayedProducts.map((product) => (
          <div key={product.id}>
            <ProductCardClient product={product} region={region} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
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
