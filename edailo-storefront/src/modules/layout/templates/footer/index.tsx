import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { siteConfig } from "../../../../../config/siteConfig"
import Image from "next/image"

export default function Footer() {
  const footer = siteConfig?.footer

  return (
    <footer className="bg-footer w-full">
      <div className="content-container py-16 text-white">

        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
              // className="text-xl font-semibold uppercase text-white hover:text-blue-400"
            >
              <Image
              src={siteConfig.logoFooter.src}
              alt={siteConfig.logoFooter.alt}
              width={120}
              height={36}
              />
              {/* {footer?.company?.name || siteConfig.companyName} */}
            </LocalizedClientLink>

            {footer?.company?.description && (
              <p className="mt-4 text-sm text-white/80 leading-relaxed">
                {footer.company.description}
              </p>
            )}
          </div>

          {/* Columns from config */}
          {footer?.columns?.map((col, i) => (
            <div key={i}>
              <h4 className="mb-4 font-medium">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <LocalizedClientLink href={link.href} className="hover:underline">
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center pt-6">
          <Text className="text-sm text-white">
            © {new Date().getFullYear()} {footer?.company?.name || siteConfig.companyName}. {footer?.copyrightText || ''}
          </Text>

          <div className="flex gap-4 mt-4 sm:mt-0 text-sm">
            {(footer?.social || []).map((s, i) => (
              <a key={i} href={s.href} className="hover:underline">
                {s.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
