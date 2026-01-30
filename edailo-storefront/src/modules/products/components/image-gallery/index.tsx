"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState, useRef, MouseEvent } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  if (!images || images.length === 0) {
    return null
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsZoomed(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  // Calculate lens position (the indicator box on the main image)
  const lensSize = 30 // percentage of image size
  const lensStyle = {
    left: `${Math.max(0, Math.min(100 - lensSize, zoomPosition.x - lensSize / 2))}%`,
    top: `${Math.max(0, Math.min(100 - lensSize, zoomPosition.y - lensSize / 2))}%`,
    width: `${lensSize}%`,
    height: `${lensSize}%`,
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnail Column - Left Side */}
      {images.length > 1 && (
        <div className="flex flex-col gap-3 w-20 lg:w-24">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? "border-ui-fg-base shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image and Zoom Container */}
      <div className="flex-1 relative">
        <div className="flex gap-4">
          {/* Main Image - Left Side */}
          <div className="flex-1">
            <Container
              ref={imageRef}
              className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle rounded-lg cursor-crosshair border border-gray-200"
              id={images[selectedImage]?.id}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {!!images[selectedImage]?.url && (
                <Image
                  src={images[selectedImage].url}
                  priority={true}
                  className="absolute inset-0 object-cover"
                  alt={`Product image ${selectedImage + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              )}

              {/* Lens Indicator - Shows which area is being zoomed */}
              {isZoomed && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none transition-all duration-75"
                  style={lensStyle}
                />
              )}
            </Container>
          </div>

          {/* Zoomed View - Right Side (appears on hover) */}
          {isZoomed && (
            <div className="hidden lg:block absolute left-full ml-4 top-0 w-[400px] h-[400px] border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-xl z-50">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${images[selectedImage].url})`,
                  backgroundSize: "300%",
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
