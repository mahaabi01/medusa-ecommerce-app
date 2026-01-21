import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetAdminReviewsSchema = createFindParams()

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  
  const queryConfig = req.validatedQuery || req.query || {}
  
  const { 
    data: reviews, 
    metadata: { count, take, skip } = {
      count: 0,
      take: 20,
      skip: 0,
    },
  } = await query.graph({
    entity: "review",
    fields: req.remoteQueryConfig?.fields || [
      "id",
      "title",
      "content",
      "rating",
      "product_id",
      "customer_id",
      "status",
      "created_at",
      "updated_at",
    ],
    pagination: {
      skip: queryConfig.offset || 0,
      take: queryConfig.limit || 20,
    },
  })

  res.json({ 
    reviews,
    count,
    limit: take,
    offset: skip,
  })
}

