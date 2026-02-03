import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type ProductDescriptionProps = {
  product: HttpTypes.StoreProduct
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  if (!product.description) {
    return null
  }

  const points = product.description.split("\n").filter(point => point.trim() !== "")

  return (
    <div id="product-description" className="mt-8">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-xl font-semibold">Description</h2>

        <ul className="list-disc list-inside space-y-2 text-base text-ui-fg-subtle leading-relaxed">
          {points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ProductDescription
