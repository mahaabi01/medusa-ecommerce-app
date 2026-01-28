// components/home/HeroBanner.tsx
import Slider from "@modules/common/components/slider";

const heroSlides = [
  {
    title: "Freshness You Can Trust, Savings You Will Love!",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=2070",
  },
  {
    title: "Premium Quality Groceries Delivered Fresh Daily",
    image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=2070",
  },
  {
    title: "Up to 50% Off on Fresh Produce & Essentials!",
    image: "https://images.unsplash.com/photo-1608686207856-001b95aac8f5?w=2070",
  },
];

export default function HeroSlider() {
  return (
    <Slider
      slides={heroSlides}
      interval={5000}
      heightClass="h-[50vh] md:h-[65vh] lg:h-[80vh]"
      overlayClass="bg-black/50"
      titleClass="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
    />
  );
}