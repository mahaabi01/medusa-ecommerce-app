"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"
import ChevronLeft from "@modules/common/icons/chevron-left"
import ChevronRight from "@modules/common/icons/chevron-right"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export function FeaturedSlider({
  product,
  countryCode,
  height = null,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
  height?: number | null
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images || []
  const displayImages =
    images.length > 0
      ? images
      : product.thumbnail
      ? [{ url: product.thumbnail }]
      : []
  const currentImage = displayImages[currentImageIndex]

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const srcFor = (img: any) => (img?.url ? img.url : img)

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="block w-full h-full"
    >
      <div className="relative w-full h-full cursor-pointer group">
        <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
          {currentImage && (
            <Image
              src={srcFor(currentImage)}
              alt={product.title || "Product image"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          )}

          <div className="absolute left-4 bottom-4 bg-black/60 text-white rounded-md p-3 shadow-md max-w-[75%] md:max-w-[55%] backdrop-blur-sm">
            <h3 className="text-base md:text-lg font-semibold mb-1 leading-tight line-clamp-2">
              {product.title}
            </h3>
            <p className="text-xs md:text-sm opacity-90 line-clamp-2">
              {product.description?.slice(0, 100)}
            </p>
          </div>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow z-10"
                aria-label="Previous"
              >
                <ChevronLeft size="20" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow z-10"
                aria-label="Next"
              >
                <ChevronRight size="20" />
              </button>
            </>
          )}
        </div>

        {displayImages.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImageIndex(idx)
                }}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentImageIndex ? "bg-gray-800" : "bg-gray-300"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
}
