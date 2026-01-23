import {
   defineMiddlewares,
   type MedusaNextFunction,
   type MedusaRequest,
   type MedusaResponse,
 } from "@medusajs/framework/http";

 const forceHttpsProtocol = (
   req: MedusaRequest,
   res: MedusaResponse,
   next: MedusaNextFunction
 ) => {
   if (process.env.NODE_ENV === "production") {
     Object.defineProperty(req, 'protocol', {
       get: () => 'https',
       configurable: true
     });
     req.headers["x-forwarded-proto"] = "https";
   }
   next();
 };

 export default defineMiddlewares({
   routes: [
     { matcher: "/auth/*", middlewares: [forceHttpsProtocol] },
     { matcher: "/admin/*", middlewares: [forceHttpsProtocol] },
   ],
 });