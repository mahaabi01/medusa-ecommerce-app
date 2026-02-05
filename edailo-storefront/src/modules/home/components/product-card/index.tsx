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
    // <LocalizedClientLink
    //   href={`/products/${product.handle}`}
    //   className="group block h-full"
    // >
    //   <div
    //     className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
    //     data-testid="product-card"
    //   >
    //     {/* Image Container - Fixed aspect ratio */}
    //     <div className="relative overflow-hidden bg-ui-bg-subtle aspect-square">
    //       {imageUrl ? (
    //         <Image
    //           src={imageUrl}
    //           alt={product.title || "Product image"}
    //           className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
    //           fill
    //           sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
    //         />
    //       ) : (
    //         <div className="w-full h-full flex items-center justify-center">
    //           <PlaceholderImage size={24} />
    //         </div>
    //       )}
    //     </div>

    //     {/* Product Info */}
    //     <div className="flex flex-col p-3 flex-1">
    //       <Text
    //         className="text-xs md:text-sm font-normal text-ui-fg-base line-clamp-2 mb-2 min-h-[2.5rem]"
    //         data-testid="product-title"
    //       >
    //         {product.title}
    //       </Text>

    //       <div className="mt-auto">
    //         {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
    //       </div>
    //     </div>
    //   </div>
    // </LocalizedClientLink>

    // Flipping cards

    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      {/* Perspective wrapper with fixed aspect ratio */}
      <div className="[perspective:1000px] w-full aspect-[3/4]">
        {/* Flip container */}
        <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          {/* FRONT SIDE */}
          <div className="absolute inset-0 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 [backface-visibility:hidden] flex flex-col">
            {/* Image */}
            <div className="relative overflow-hidden bg-ui-bg-subtle w-full aspect-square">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title || "Product image"}
                  className="object-cover w-full h-full"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlaceholderImage size={24} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col p-3 flex-1">
              <Text className="text-xs md:text-sm text-ui-fg-base line-clamp-2">
                {product.title}
              </Text>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 rounded-lg shadow-lg border border-gray-200 overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title || "Product image"}
                  className="object-cover w-full h-full"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content positioned lower */}
            <div className="relative h-full flex flex-col justify-end p-5 pb-6 text-white">
              <Text className="text-base font-bold mb-3 line-clamp-2 drop-shadow-lg">
                {product.title}
              </Text>

              {cheapestPrice && (
                <div className="mb-4 transform scale-105 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg inline-block">
                  <PreviewPrice price={cheapestPrice} />
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm font-semibold drop-shadow-md">
                <span>View Details</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
