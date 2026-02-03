"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import X from "@modules/common/icons/x"

type CategoryFilterProps = {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category")

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategory === categoryId) {
      // If clicking the same category, remove the filter
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }
    
    // Reset to page 1 when changing category
    params.delete("page")
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-ui-fg-base">Category</h3>
        {selectedCategory && (
          <button
            onClick={handleClearFilter}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Clear category filter"
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>
      
      <ul className="space-y-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id
          
          return (
            <li key={category.id}>
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  isSelected
                    ? "bg-gray-200 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
