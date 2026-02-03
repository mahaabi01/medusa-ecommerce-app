"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion } from "./regions"

export const searchProducts = async ({
  query,
  countryCode,
  limit = 10,
}: {
  query: string
  countryCode: string
  limit?: number
}): Promise<{
  products: HttpTypes.StoreProduct[]
  count: number
}> => {
  if (!query || query.trim().length === 0) {
    return {
      products: [],
      count: 0,
    }
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return {
      products: [],
      count: 0,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    // Search by title, description, and other fields
    const { products, count } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: {
        q: query,
        limit,
        region_id: region.id,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,+categories,+collection",
      },
      headers,
      next: {
        ...next,
        revalidate: 60, // Cache for 1 minute for search results
      },
    })

    // Additional client-side filtering for better relevance
    const searchTerms = query.toLowerCase().split(" ").filter(Boolean)
    
    const scoredProducts = products.map((product) => {
      let score = 0
      const title = product.title?.toLowerCase() || ""
      const description = product.description?.toLowerCase() || ""
      const handle = product.handle?.toLowerCase() || ""
      
      // Exact match in title gets highest score
      if (title === query.toLowerCase()) {
        score += 100
      }
      
      // Title starts with query
      if (title.startsWith(query.toLowerCase())) {
        score += 50
      }
      
      // Each search term found in title
      searchTerms.forEach((term) => {
        if (title.includes(term)) score += 10
        if (description.includes(term)) score += 5
        if (handle.includes(term)) score += 3
      })
      
      // Check tags
      if (product.tags) {
        product.tags.forEach((tag: any) => {
          const tagValue = tag.value?.toLowerCase() || ""
          searchTerms.forEach((term) => {
            if (tagValue.includes(term)) score += 7
          })
        })
      }
      
      // Check categories
      if (product.categories) {
        product.categories.forEach((category: any) => {
          const categoryName = category.name?.toLowerCase() || ""
          searchTerms.forEach((term) => {
            if (categoryName.includes(term)) score += 8
          })
        })
      }
      
      // Check collection
      if (product.collection) {
        const collectionTitle = product.collection.title?.toLowerCase() || ""
        searchTerms.forEach((term) => {
          if (collectionTitle.includes(term)) score += 6
        })
      }
      
      return { product, score }
    })
    
    // Sort by score and filter out zero scores
    const sortedProducts = scoredProducts
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product)

    return {
      products: sortedProducts,
      count: sortedProducts.length,
    }
  } catch (error) {
    console.error("Search error:", error)
    return {
      products: [],
      count: 0,
    }
  }
}
