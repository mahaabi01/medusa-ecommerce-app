// components/home/HeroBanner.tsx
import Slider from "@modules/common/components/slider";
import Link from "next/link";
import { siteConfig } from "../../../../../config/siteConfig";

const fallbackSlides = [
  {
    title: "Freshness You Can Trust, Savings You Will Love!",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=2070",
    cta1: { label: "Shop Now", href: "/store" },
    cta2: { label: "Explore Now", href: "/collections" },
  },
];

export default function HeroSlider() {
  const slides = siteConfig?.home?.heroSlides ?? fallbackSlides;

  const sliderSlides = slides.map((s) => ({
    ...s,
    children: (
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3 justify-center md:justify-start">
        <Link
          href={s?.cta1?.href || "/store"}
          className="inline-flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-md shadow"
        >
          {s?.cta1?.label || "Shop Now"}
        </Link>

        <Link
          href={s?.cta2?.href || "/collections"}
          className="inline-flex items-center px-4 py-2 bg-white text-primary font-semibold rounded-md shadow"
        >
          {s?.cta2?.label || "Explore Now"}
        </Link>
      </div>
    ),
  }));

  return (
    <Slider
      slides={sliderSlides}
      interval={5000}
      heightClass="h-[40vh] md:h-[40vh] lg:h-[40vh]"
      overlayClass="bg-black/50"
      titleClass="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
    />
  );
}