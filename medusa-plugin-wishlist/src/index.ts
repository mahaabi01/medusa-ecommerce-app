// Main entry point
import wishlistModule from "./modules/wishlist"
export { WISHLIST_MODULE } from "./modules/wishlist"

// Export the module as default (Medusa expects this)
export default wishlistModule

// Also export it as wishlistModule for named import
export { wishlistModule }
