import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import HeroSlider from "@modules/home/components/hero-slider"
import AdSlider from "@modules/home/components/ad-slider"
import ProductList from "@modules/home/components/product-list"
import JustForYou from "@modules/home/components/just-for-you"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { siteConfig } from "../../../../config/siteConfig"

export const metadata: Metadata = {
  title: siteConfig.metadata.title,
  description:
    siteConfig.metadata.description
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSlider />
      
      {/* Latest Products Section */}
      <div className="bg-white dark:bg-ui-bg-base">
        <ProductList 
          countryCode={countryCode}
          limit={12}
          type="latest"
          title="New Arrivals"
          showAll={true}
        />
      </div>

      {/* Ad Banner (full width) */}
      <AdSlider />

      {/* Today's Deals Section */}
      <div>
        <ProductList 
          countryCode={countryCode}
          limit={12}
          type="deals"
          title="Today's Best Deals"
          showAll={true}
        />
      </div>

      {/* Just For You Section */}
      <JustForYou countryCode={countryCode} region={region} limit={4} />

      {/* Featured Collections */}
      <div className="py-12 bg-ui-bg-subtle">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
