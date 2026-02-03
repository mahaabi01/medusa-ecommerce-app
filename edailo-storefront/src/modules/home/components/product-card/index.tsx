import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import PreviewPrice from "@modules/products/components/product-preview/price"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

export default async function ProductCard({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const imageUrl = product.thumbnail || product.images?.[0]?.url

  return (
    <LocalizedClientLink 
      href={`/products/${product.handle}`} 
      className="group block h-full"
    >
      <div 
        className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
        data-testid="product-card"
      >
        {/* Image Container - Fixed aspect ratio */}
        <div className="relative overflow-hidden bg-ui-bg-subtle aspect-square">
          {imageUrl ? (
            <Image
              src={imageUrl} 
              alt={product.title || "Product image"}
              className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col p-3 flex-1">
          <Text 
            className="text-xs md:text-sm font-normal text-ui-fg-base line-clamp-2 mb-2 min-h-[2.5rem]" 
            data-testid="product-title"
          >
            {product.title}
          </Text>
          
          <div className="mt-auto">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
