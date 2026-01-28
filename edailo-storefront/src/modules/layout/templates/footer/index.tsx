import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@medusajs/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MedusaCTA from "@modules/layout/components/medusa-cta";
import { siteConfig } from "../../../../../config/siteConfig";

export default async function Footer() {
  const { collections } = await listCollections({ fields: "*products" });
  const productCategories = await listCategories();

  return (
    <footer className="border-t border-ui-border-base bg-footer w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-footer-text hover:text-ui-fg-base uppercase"
            >
              {siteConfig.companyName}
            </LocalizedClientLink>
          </div>

          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {/* Categories */}
            {productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-footer-text">
                  {siteConfig.footer.sectionLabels.categories}
                </span>
                <ul className="grid grid-cols-1 gap-2">
                  {productCategories.slice(0, 6).map((c) => {
                    if (c.parent_category) return null;

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 text-footer-text txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-ui-fg-base"
                                  href={`/categories/${child.handle}`}
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Collections */}
            {collections?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-footer-text">
                  {siteConfig.footer.sectionLabels.collections}
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    { "grid-cols-2": collections.length > 3 }
                  )}
                >
                  {collections.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medusa Links */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-footer-text">
                {siteConfig.footer.sectionLabels.edailo}
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-footer-text txt-small">
                {siteConfig.footer.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ui-fg-base"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex w-full mb-16 justify-between text-footer-text">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} {siteConfig.companyName}.{" "}
            {siteConfig.footer.copyrightText}
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  );
}
