import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { siteConfig } from "../../../../../../config/siteConfig"

export const metadata: Metadata = {
  title: siteConfig.login.title ,
  description: siteConfig.login.description,
}

export default function Login() {
  return <LoginTemplate />
}
