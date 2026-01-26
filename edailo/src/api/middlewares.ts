import { defineMiddlewares } from "@medusajs/medusa"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/esewa/*",
      middlewares: [
        (req, res, next) => {
          // Set CORS headers for eSewa verification endpoint
          const allowedOrigins = process.env.STORE_CORS?.split(",") || ["http://localhost:8000"]
          const origin = req.headers.origin
          
          if (origin && allowedOrigins.includes(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin)
            res.setHeader("Access-Control-Allow-Credentials", "true")
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
          }
          
          // Handle preflight
          if (req.method === "OPTIONS") {
            res.status(204).end()
            return
          }
          
          next()
        },
      ],
    },
  ],
})
