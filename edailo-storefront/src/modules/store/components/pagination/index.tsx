"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ChevronLeft from "@modules/common/icons/chevron-left"
import ChevronRight from "@modules/common/icons/chevron-right"

export function Pagination({
  page,
  totalPages,
  'data-testid': dataTestid
}: {
  page: number
  totalPages: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Function to render a page button
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx(
        "min-w-[32px] h-8 px-2.5 rounded-md text-xs font-medium transition-colors",
        {
          "bg-gray-200 text-gray-900": isCurrent,
          "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200": !isCurrent,
        }
      )}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="min-w-[32px] h-8 flex items-center justify-center text-gray-400 text-xs"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...Array.from({ length: 5 }, (_, i) => i + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...Array.from({ length: 3 }, (_, i) => page - 1 + i).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  // Render the component
  return (
    <div className="flex justify-center items-center w-full mt-4 mb-4">
      <div className="flex gap-1.5 items-center justify-center" data-testid={dataTestid}>
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={clx(
            "h-8 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
            {
              "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200": page > 1,
              "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100": page === 1,
            }
          )}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        {/* Page Numbers */}
        {renderPageButtons()}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={clx(
            "h-8 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
            {
              "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200": page < totalPages,
              "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100": page === totalPages,
            }
          )}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
