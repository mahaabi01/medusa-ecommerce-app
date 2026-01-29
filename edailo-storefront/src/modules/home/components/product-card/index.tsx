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
      className="group block"
    >
      <div 
        className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm"
        data-testid="product-card"
      >
        <div className="relative overflow-hidden bg-ui-bg-subtle aspect-square p-3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title || "Product image"}
              className="object-contain w-full h-full transform transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
              width={400}
              height={400}
              quality={75}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderImage size={24} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
          <div className="flex flex-col p-3 space-y-1.5">
          <Text 
            className="text-xs md:text-sm font-medium text-ui-fg-base line-clamp-2 min-h-[2.5rem] transition-colors" 
            data-testid="product-title"
          >
            {product.title}
          </Text>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-1.5">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
