"use client"

import { addToCart, buyNow } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: Number(quantity),
        countryCode,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  // handle buy now - create temporary cart and redirect to checkout
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null

    setIsBuyingNow(true)

    try {
      // Create a fresh cart with only this item and redirect to checkout
      await buyNow({
        variantId: selectedVariant.id,
        quantity: Number(quantity),
        countryCode,
      })
      // The buyNow function will handle the redirect
    } catch (error) {
      setIsBuyingNow(false)
      console.error("Error during buy now:", error)
    }
  }

  // Handle quantity increment
  const incrementQuantity = () => {
    const maxQuantity = selectedVariant?.inventory_quantity || 99
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1)
    }
  }

  // Handle quantity decrement
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Handle manual quantity input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const maxQuantity = selectedVariant?.inventory_quantity || 99
    
    if (isNaN(value) || value < 1) {
      setQuantity(1)
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity)
    } else {
      setQuantity(value)
    }
  }

  // Get button text based on state
  const getButtonText = () => {
    if (isAdding) return "Adding..."
    if (!selectedVariant) return "Select options"
    if (!inStock) return "Out of stock"
    return "Add to cart"
  }

  // Get buy now button text
  const getBuyNowButtonText = () => {
    if (isBuyingNow) return "Processing..."
    return "Buy Now"
  }

  // Check if buttons should be disabled
  const isButtonDisabled = !inStock || !selectedVariant || !!disabled || isAdding || isBuyingNow || !isValidVariant
  const isBuyNowDisabled = !inStock || !selectedVariant || !!disabled || isAdding || isBuyingNow || !isValidVariant

  return (
    <>
      <div className="flex flex-col gap-y-5" ref={actionsRef}>
        {/* Price - Show at top */}
        <div className="border-t border-b border-gray-200 py-3">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>

        {/* Options Selection */}
        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-3">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    data-testid="product-options"
                    disabled={!!disabled || isAdding || isBuyingNow}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-ui-fg-base">Quantity</label>
          <div className="flex items-center">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1 || !!disabled || isAdding || isBuyingNow}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <span className="text-xl font-medium">−</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={!!disabled || isAdding || isBuyingNow}
                className="w-16 h-10 text-center border-x border-gray-300 focus:outline-none text-sm font-medium"
                min="1"
                max={selectedVariant?.inventory_quantity || 99}
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= (selectedVariant?.inventory_quantity || 99) || !!disabled || isAdding || isBuyingNow}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <span className="text-xl font-medium">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
            variant="primary"
            className="w-full h-11 text-sm font-medium bg-green-600 hover:bg-green-500 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-white"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {getButtonText()}
          </Button>

          {/* Buy Now Button */}
          <Button
            onClick={handleBuyNow}
            disabled={isBuyNowDisabled}
            variant="secondary"
            className="w-full h-11 text-sm font-medium border-2 border-green-600 text-black bg-transparent hover:bg-green-50 active:bg-green-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            isLoading={isBuyingNow}
            data-testid="buy-now-button"
          >
            {getBuyNowButtonText()}
          </Button>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isBuyingNow}
        />
      </div>
    </>
  )
}
