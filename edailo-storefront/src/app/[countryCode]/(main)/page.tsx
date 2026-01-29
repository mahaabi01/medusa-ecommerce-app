import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import HeroSlider from "@modules/home/components/hero-slider"
import AdSlider from "@modules/home/components/ad-slider"
import ProductList from "@modules/home/components/product-list"
import SectionDivider from "@modules/home/components/section-divider"
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
          title="🆕 New Arrivals"
          subtitle="Check out our latest products just added to the store"
          showAll={true}
        />
      </div>

      <SectionDivider />

      {/* Ad Slider Section */}
      <div className="content-container py-8 md:py-12">
        <AdSlider />
      </div>

      <SectionDivider />

      {/* Today's Deals Section */}
      <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/10 dark:via-red-950/10 dark:to-pink-950/10">
        <ProductList 
          countryCode={countryCode}
          limit={12}
          type="deals"
          title="🔥 Today's Best Deals"
          subtitle="Save big on these amazing offers - limited time only!"
          showAll={true}
        />
      </div>

      {/* Featured Collections */}
      <div className="py-12 bg-ui-bg-subtle">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
