
import { 
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { 
  PostStoreCreateWishlistItem,
} from "./store/customers/me/wishlists/items/validators"
import { authenticate } from "@medusajs/medusa"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/customers/me/wishlists/items",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostStoreCreateWishlistItem),
      ],
    },
  ],
})