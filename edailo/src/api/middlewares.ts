import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store*",
      methods: ["POST", "PUT"],
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          console.log("Received a request!");
          next();
        },
      ],
    },
  ],
});
