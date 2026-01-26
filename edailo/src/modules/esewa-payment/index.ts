import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import { EsewaPaymentService } from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [EsewaPaymentService]
})