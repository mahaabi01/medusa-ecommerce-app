import { Metadata } from "next"

import ProductList from "@modules/home/components/product-list"
import SectionDivider from "@modules/home/components/section-divider"
import { getRegion } from "@lib/data/regions"
import { siteConfig } from "../../../../../config/siteConfig"

export const metadata: Metadata = {
  title: "New Arrivals",
  description: siteConfig.metadata.description,
}

export default async function LatestPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) return null

  return (
    <>
      <div className="bg-white dark:bg-ui-bg-base">
        <ProductList countryCode={countryCode} limit={24} type="latest" title={"New Arrivals"} showAll={false} />
      </div>
      <SectionDivider />
    </>
  )
}
