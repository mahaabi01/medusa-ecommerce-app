import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HeroSlider from "@modules/home/components/hero-slider"
import AdSlider from "@modules/home/components/ad-slider"
import ProductList from "@modules/home/components/product-list"
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
      <HeroSlider />
      
      <ProductList 
        countryCode={countryCode}
        limit={8}
        title="Featured Products"
        showAll={true}
      />
      <ProductList 
        countryCode={countryCode}
        limit={8}
        title="Todays Deals"
        showAll={true}
      />
      <ProductList 
        countryCode={countryCode}
        limit={8}
        title="Todays Deals"
        showAll={true}
      />
      
      <div className="content-container py-12">
        <AdSlider />
      </div>

      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
