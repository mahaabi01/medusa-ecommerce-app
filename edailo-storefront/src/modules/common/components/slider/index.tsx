// components/ui/CarouselBase.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";

interface Slide {
  title: string;
  image?: string;
  children?: ReactNode;
}

interface CarouselBaseProps {
  slides: Slide[];
  interval?: number;
  className?: string;
  heightClass?: string;
  overlayClass?: string;
  titleClass?: string;
}

export default function Slider({
  slides,
  interval = 4000,
  className = "",
  heightClass = "h-[45vh] md:h-[55vh] lg:h-[65vh]",
  overlayClass = "bg-black/45",
  titleClass = "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
}: CarouselBaseProps) {
  const [current, setCurrent] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides.length, interval]);

  // Safety check
  if (!slides?.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-900 text-white">
        No slides provided
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full ${className}`}>
      {/* Full-width container trick */}
      <div
        className={`w-screen relative left-1/2 right-1/2 -mx-[50vw] ${heightClass} overflow-hidden`}
      >
        {/* Sliding container */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index} // ← most reliable & safe for carousels
              className="w-full flex-shrink-0 relative h-full"
            >
              {/* Background image */}
              {slide.image && (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              )}

              {/* Overlay */}
              <div className={`absolute inset-0 ${overlayClass}`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
                <div className="max-w-4xl text-center md:text-left mx-auto w-full">
                  <h1
                    className={`${titleClass} font-bold leading-tight text-white drop-shadow-2xl`}
                    style={{
                      fontFamily:
                        'Medusa, Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
                      // Responsive, fixed-size relative to viewport height so it scales with the slider
                      fontSize: 'clamp(1.75rem, 5vh, 4.5rem)',
                      lineHeight: 1.05,
                    }}
                  >
                    {slide.title}
                  </h1>

                  {slide.children && (
                    <div className="mt-4 md:mt-6 text-white drop-shadow-lg">
                      {slide.children}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-white w-10 h-3"
                    : "bg-white/60 w-3 h-3 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}