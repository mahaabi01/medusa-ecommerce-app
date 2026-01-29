// app/components/layout/SubNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";





const navItems = [
  { name: "Deals", path: "/deals" },
  { name: "Best Sellers", path: "/best-sellers" },
  { name: "Latest", path: "/latest" },
  { name: "Customer Service", path: "/customer-service" },
  { name: "Sell on eDAILO", path: "/sell" },
] as const;

export default function SubNavbar() {
  const pathname = usePathname();

  return (
    <nav className="relative bg-[#132440] border-b border-gray-700 shadow-lg">
      <div className="max-w-screen-2xl mx-auto flex items-center h-10 px-4 md:px-8 lg:px-16 xl:px-32">
        {/* Categories menu trigger */}
        <div className="relative mr-6">
          {/* Categories menu can be added here */}
        </div>

        {/* Navigation links – visible on lg+ */}
        <div className="hidden lg:flex items-center space-x-8 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  text-white text-sm font-medium transition hover:text-gray-300
                  ${isActive ? "text-[#02A6E3] underline underline-offset-4" : ""}
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />
      </div>
    </nav>
  );
}