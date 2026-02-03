import InteractiveLink from "@modules/common/components/interactive-link"
import { Metadata } from "next"
import { siteConfig } from "../../../../config/siteConfig"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default async function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">{siteConfig.page.notfound}</h1>
      <p className="text-small-regular text-ui-fg-base">
       {siteConfig.page.doesNotExit}
      </p>
      <InteractiveLink href="/">{siteConfig.page.frontpage}</InteractiveLink>
    </div>
  )
}
