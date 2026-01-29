// app/components/layout/SubNavbar.tsx

import Link from "next/link";
import { HttpTypes } from "@medusajs/types";
import { listCategories } from "@lib/data/categories";
import CategoryDropdown from "@modules/layout/components/category-dropdown";

const navItems = [
  { name: "Deals", path: "/deals" },
  { name: "Best Sellers", path: "/best-sellers" },
  { name: "Latest", path: "/latest" },
  { name: "Customer Service", path: "/customer-service" },
  { name: "Sell on eDAILO", path: "/sell" },
] as const;

export default async function SubNavbar() {
  let categories: HttpTypes.StoreProductCategory[] = [];

  try {
    categories = await listCategories({ limit: 50 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <nav className="relative bg-[#132440] border-b border-gray-700 shadow-lg">
      <div className="max-w-screen-2xl mx-auto flex items-center h-10 px-4 md:px-8 lg:px-16 xl:px-32 gap-6">
        {/* Menu icon with categories dropdown */}
        {categories.length > 0 && <CategoryDropdown categories={categories} />}

        {/* Navigation links – responsive: visible on small devices with horizontal scroll */}
        <div className="flex items-center space-x-4 md:space-x-8 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-white text-xs md:text-sm font-medium transition hover:text-gray-300 px-2 py-1 whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex-1" />
      </div>
    </nav>
  );
}