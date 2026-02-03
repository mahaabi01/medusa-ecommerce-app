import { siteConfig } from "../../../../../config/siteConfig"
import Slider from "@modules/common/components/slider"
import Link from "next/link"

export default function AdSlider() {
  const banner = siteConfig?.home?.adBanner

  if (!banner) {
    return null
  }
  // Use configured slides if present, otherwise fall back to single banner slide
  const rawSlides = banner.slides && banner.slides.length ? banner.slides : [
    {
      title: banner.title,
      cta: banner.cta,
    },
  ]

  const slides = rawSlides.map((s) => ({
    ...s,
    children: (
      <div className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start">
        <Link href={s?.cta?.href || banner.cta?.href || "/store"} className="inline-flex items-center px-5 py-3 bg-primary text-white font-semibold rounded-md shadow">
          {s?.cta?.label || banner.cta?.label || "Shop Now"}
        </Link>
      </div>
    ),
  }))

  return (
    <div className="w-full overflow-hidden">
      <Slider
        slides={slides}
        interval={6000}
        heightClass={banner.heightClass || "h-[44vh] md:h-[50vh]"}
        overlayClass="bg-black/30"
        titleClass="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white"
      />
    </div>
  )
}
