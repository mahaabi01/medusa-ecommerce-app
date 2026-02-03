"use server"

import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export async function loadMoreJustForYouProducts(
  countryCode: string,
  page: number
): Promise<{
  products: HttpTypes.StoreProduct[]
  hasMore: boolean
}> {
  try {
    const limit = 12 // Fetch 12 products (2 rows × 6 columns)
    
    // Calculate offset: page 1 = 0, page 2 = 12, page 3 = 24, etc.
    // But we need to account for the initial 12 products already shown
    // So page 2 should start at offset 12
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

    console.log(`Load More - Page: ${page}, Products fetched: ${products?.length}, Total count: ${count}, Has next: ${nextPage !== null}`)

    return {
      products: products || [],
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
