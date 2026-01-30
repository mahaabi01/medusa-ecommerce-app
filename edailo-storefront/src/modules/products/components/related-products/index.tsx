import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let relatedProducts: HttpTypes.StoreProduct[] = []

  // Step 1: Try to get products from the same collection
  if (product.collection_id) {
    const collectionQueryParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      collection_id: [product.collection_id],
      is_giftcard: false,
      limit: 10,
    }

    const collectionProducts = await listProducts({
      queryParams: collectionQueryParams,
      countryCode,
    }).then(({ response }) => {
      return response.products.filter(
        (responseProduct) => responseProduct.id !== product.id
      )
    })

    relatedProducts = [...collectionProducts]
  }

  // Step 2: If we don't have enough products, try to get products with matching tags
  if (relatedProducts.length < 6 && product.tags && product.tags.length > 0) {
    const tagQueryParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      tag_id: product.tags.map((t) => t.id).filter(Boolean) as string[],
      is_giftcard: false,
      limit: 10,
    }

    const tagProducts = await listProducts({
      queryParams: tagQueryParams,
      countryCode,
    }).then(({ response }) => {
      return response.products.filter(
        (responseProduct) => 
          responseProduct.id !== product.id &&
          !relatedProducts.some(p => p.id === responseProduct.id)
      )
    })

    relatedProducts = [...relatedProducts, ...tagProducts]
  }

  // Step 3: If still not enough, get random products from the same region
  if (relatedProducts.length < 6) {
    const randomQueryParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      is_giftcard: false,
      limit: 10,
    }

    const randomProducts = await listProducts({
      queryParams: randomQueryParams,
      countryCode,
    }).then(({ response }) => {
      return response.products.filter(
        (responseProduct) => 
          responseProduct.id !== product.id &&
          !relatedProducts.some(p => p.id === responseProduct.id)
      )
    })

    relatedProducts = [...relatedProducts, ...randomProducts]
  }

  if (!relatedProducts.length) {
    return null
  }

  // Limit to 6 products for a single row
  const displayProducts = relatedProducts.slice(0, 6)

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-ui-fg-base mb-2">
          Related Products
        </h2>
        <p className="text-sm text-ui-fg-subtle">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {displayProducts.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
