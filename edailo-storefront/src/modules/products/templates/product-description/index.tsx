import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type ProductDescriptionProps = {
  product: HttpTypes.StoreProduct
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  if (!product.description) {
    return null
  }

  return (
    <div id="product-description" className="mt-8">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <Text
          className="text-base text-ui-fg-subtle whitespace-pre-line leading-relaxed"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductDescription
