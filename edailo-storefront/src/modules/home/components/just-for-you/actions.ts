"use server"

import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export async function loadMoreJustForYouProducts(
  countryCode: string,
  page: number,
  excludeProductIds: string[] = []
): Promise<{
  products: HttpTypes.StoreProduct[]
  hasMore: boolean
}> {
  try {
    const limit = 12 // Fetch 12 products (2 rows × 6 columns)
    
    const {
      response: { products, count },
      nextPage,
    } = await listProducts({
      pageParam: page,
      queryParams: {
        limit,
      },
      countryCode,
    })

    // Filter out products that are already displayed
    const filteredProducts = products?.filter(
      product => !excludeProductIds.includes(product.id)
    ) || []

    console.log(`Load More - Page: ${page}, Products fetched: ${products?.length}, After filtering: ${filteredProducts.length}, Total count: ${count}, Has next: ${nextPage !== null}`)

    return {
      products: filteredProducts,
      hasMore: nextPage !== null,
    }
  } catch (error) {
    console.error("Error loading more products:", error)
    return {
      products: [],
      hasMore: false,
    }
  }
}
