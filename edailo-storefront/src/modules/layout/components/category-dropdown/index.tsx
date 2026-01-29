"use client";

import { HttpTypes } from "@medusajs/types";
import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@modules/common/icons/menu";

interface CategoryDropdownProps {
  categories: HttpTypes.StoreProductCategory[];
}

export default function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter only parent categories (those without parent_category)
  const parentCategories = categories.filter((cat) => !cat.parent_category);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Menu trigger button with icon */}
      <button className="flex items-center justify-center bg-primary hover:bg-opacity-90 transition h-10 w-12 rounded-none">
        <MenuIcon size={24} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-0 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          {/* Dropdown content */}
          <div className="max-h-96 overflow-y-auto py-2">
            {parentCategories.length > 0 ? (
              parentCategories.map((category) => (
                <div key={category.id} className="border-b last:border-b-0">
                  {/* Parent category link */}
                  <Link
                    href={`/categories/${category.handle}`}
                    className="block px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {category.name}
                    </div>
                  </Link>

                  {/* Child categories */}
                  {category.category_children &&
                    category.category_children.length > 0 && (
                      <div className="bg-gray-50 px-4 py-2">
                        <ul className="space-y-1">
                          {category.category_children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/categories/${child.handle}`}
                                className="block text-xs text-gray-600 hover:text-[#02A6E3] hover:font-medium transition"
                              >
                                • {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No categories available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
