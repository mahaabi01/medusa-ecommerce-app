import Link from "next/link"
import Slider from "@modules/common/components/slider"
import { Button } from "@medusajs/ui"

const mainSlides = [
  {
    title: "Freshness You Can Trust, Savings You Will Love!",
    children: (
      <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start">
        <Button size="large" asChild className="rounded-full">
          <Link href="/products">Shop Now</Link>
        </Button>
        <Button variant="secondary" size="large" asChild className="rounded-full">
          <Link href="/products">Explore Deals</Link>
        </Button>
      </div>
    ),
  },
  {
    title: "Premium Quality Groceries Delivered Fresh Daily",
    children: (
      <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start">
        <Button size="large" asChild className="rounded-full">
          <Link href="/products">Browse Fresh Items</Link>
        </Button>
      </div>
    ),
  },
  {
    title: "Up to 50% Off on Fresh Produce & Essentials!",
    children: (
      <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start">
        <Button variant="danger" size="large" asChild className="rounded-full">
          <Link href="/deals">See Today's Deals</Link>
        </Button>
      </div>
    ),
  },
]

export default function AdSlider() {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      <Slider
        slides={mainSlides}
        interval={4500}
        heightClass="h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh]"
        overlayClass="bg-black/40"
        titleClass="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
        className="rounded-2xl"
      />
    </div>
  )
}
