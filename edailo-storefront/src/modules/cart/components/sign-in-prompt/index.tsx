import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { siteConfig } from "../../../../../config/siteConfig"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          {siteConfig.messages.accountInfo.alreadyhaveaccount}
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          {siteConfig.messages.accountInfo.signNew}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            {siteConfig.buttons.signIn}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
