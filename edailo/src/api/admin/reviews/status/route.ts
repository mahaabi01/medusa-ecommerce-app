import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { updateReviewWorkflow } from "../../../../workflows/update-review"
import { z } from "zod"

export const PostAdminUpdateReviewsStatusSchema = z.object({
  ids: z.array(z.string()),
  status: z.enum(["pending", "approved", "rejected"]),
})

export async function POST(
  req: MedusaRequest<z.infer<typeof PostAdminUpdateReviewsStatusSchema>>, 
  res: MedusaResponse
) {
  const input = req.validatedBody || req.body
  const { ids, status } = input

  const { result } = await updateReviewWorkflow(req.scope).run({
    input: ids.map((id) => ({
      id,
      status,
    })),
  })

  res.json(result)
}
