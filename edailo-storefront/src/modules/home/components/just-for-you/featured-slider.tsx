"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"
import ChevronLeft from "@modules/common/icons/chevron-left"
import ChevronRight from "@modules/common/icons/chevron-right"

export function FeaturedSlider({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images || []
  const displayImages = images.length > 0 ? images : product.thumbnail ? [{ url: product.thumbnail }] : []
  const currentImage = displayImages[currentImageIndex]

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const srcFor = (img: any) => (img?.url ? img.url : img)

  return (
    <div className="relative w-full">
      <div className="relative w-full h-80 md:h-96 lg:h-[560px] bg-gray-50 rounded-lg overflow-hidden">
        {currentImage && (
          <Image src={srcFor(currentImage)} alt={product.title || "Product image"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        )}

        <div className="absolute left-6 bottom-6 bg-[#8B5E4C] text-white rounded-lg p-6 shadow-lg max-w-[85%] md:max-w-[70%]">
          <h3 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">{product.title}</h3>
          <p className="text-sm opacity-95 line-clamp-4">{product.description?.slice(0, 220)}...</p>
        </div>

        <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow" aria-label="Previous">
          <ChevronLeft size="20" />
        </button>
        <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition shadow" aria-label="Next">
          <ChevronRight size="20" />
        </button>
      </div>

      {displayImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {displayImages.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-2 h-2 rounded-full transition ${idx === currentImageIndex ? "bg-gray-800" : "bg-gray-300"}`} aria-label={`Go to image ${idx + 1}`} />
          ))}
        </div>
      )}
    </div>
  )
}
