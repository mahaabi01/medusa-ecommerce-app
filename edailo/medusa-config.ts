import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionOptions: {
      name: "connect.sid",
      resave: true,
      saveUninitialized: true,
      rolling: true,
      ttl: 7*24*60*60*1000,
    },
    cookieOptions: process.env.NODE_ENV === "production" 
    ? { sameSite: "none", secure: true }
    : { sameSite: "lax", secure: false },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  plugins: [
    {
      resolve: "medusa-plugin-wishlist",
      options: {},
    },
  ],
})
