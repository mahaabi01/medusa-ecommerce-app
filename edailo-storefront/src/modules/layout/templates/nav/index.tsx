import { Suspense } from "react"
import { siteConfig } from "../../../../../config/siteConfig"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"

import Image from "next/image"
import SearchBar from "@modules/layout/components/search-bar"
import Profile from "@modules/common/icons/profile"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
  <header className="relative h-16 mx-auto border-b duration-200 bg-navbar border-ui-border-base">
    <nav className="content-container flex items-center justify-between w-full h-full text-small-regular">

      {/* LEFT: Logo */}
      <div className="flex-shrink-0 flex items-center h-full">
        <LocalizedClientLink
          href="/"
          className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
          data-testid="nav-store-link"
        >
          <Image
            src={siteConfig.logo.src}
            alt={siteConfig.logo.alt}
            width={120}
            height={36}
          />
        </LocalizedClientLink>
      </div>

      {/* CENTER: Big Search Bar */}
      <div className="flex-1 flex justify-center px-5">
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </div>

      {/* RIGHT: Account + Cart */}
      <div className="flex items-center gap-x-6 flex-shrink-0">
        <div className="hidden small:flex items-center gap-x-6 h-full">
          <LocalizedClientLink
            className="text-white hover:text-ui-fg-base"
            href={siteConfig.navLinks.account.href}
            data-testid="nav-account-link"
          >
            <Profile className="w-10 h-10 text-white-text" />
            
          </LocalizedClientLink>
        </div>

        <Suspense
          fallback={
            <LocalizedClientLink
              className="text-white hover:text-ui-fg-base flex gap-2"
              href={siteConfig.navLinks.cart.href}
              data-testid="nav-cart-link"
            >
              {siteConfig.navLinks.cart.label}
            </LocalizedClientLink>
          }
        >
          <CartButton />
        </Suspense>
      </div>

    </nav>
  </header>
</div>

  )
}
