import { NextRequest } from "next/server"

import { apiError, apiSuccess } from "@/lib/api/response"
import { getSessionUser } from "@/lib/auth"
import { invalidateCampaignCache } from "@/lib/cache/campaign"
import {
  actorFromUser,
  canDeleteDelivery,
  canEditDelivery,
  canUseGC,
} from "@/lib/deliveries/authorization"
import { DELIVERY_SELECT } from "@/lib/deliveries/constants"
import { deliveryUpdateSchema } from "@/lib/deliveries/schema"
import { createServiceClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function findGC(
  supabase: ReturnType<typeof createServiceClient>,
  gcId: string,
) {
  const { data, error } = await supabase
    .from("gcs")
    .select("id, tribe")
    .eq("id", gcId)
    .maybeSingle()

  if (error) throw error
  return data as { id: string; tribe: string } | null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser()
    if (!user) return apiError("Não autenticado", 401)

    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return apiError("Entrega inválida", 400)

    const body = await request.json().catch(() => null)
    const parsed = deliveryUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos", 400)
    }

    const actor = actorFromUser(user)
    const supabase = createServiceClient()
    const { data: delivery, error: findError } = await supabase
      .from("deliveries")
      .select("id, memberId, gcId, type, quantity")
      .eq("id", id)
      .maybeSingle()

    if (findError) return apiError(findError.message, 500)
    if (!delivery) return apiError("Entrega não encontrada", 404)
    if (!canEditDelivery(actor, delivery)) {
      return apiError("Você só pode editar suas próprias entregas", 403)
    }

    if (
      parsed.data.type &&
      parsed.data.type !== delivery.type &&
      parsed.data.quantity === undefined
    ) {
      return apiError("Informe a quantidade ao alterar o tipo", 400)
    }

    const updates: Record<string, string | number | null> = {}

    if (parsed.data.type !== undefined) updates.type = parsed.data.type
    if (parsed.data.quantity !== undefined) {
      updates.quantity = parsed.data.quantity
    }
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes
    if (parsed.data.photoUrl !== undefined) {
      updates.photoUrl = parsed.data.photoUrl
    }

    if (parsed.data.gcId !== undefined) {
      const gc = await findGC(supabase, parsed.data.gcId)
      if (!gc) return apiError("GC não encontrado", 404)
      if (!canUseGC(actor, gc.tribe)) {
        return apiError("GC fora da sua tribo", 403)
      }
      updates.gcId = parsed.data.gcId
    }

    const { data, error } = await supabase
      .from("deliveries")
      .update(updates)
      .eq("id", id)
      .select(DELIVERY_SELECT)
      .single()

    if (error) return apiError(error.message, 400)

    invalidateCampaignCache()
    return apiSuccess(data)
  } catch (error) {
    console.error("PATCH /api/deliveries/[id] error:", error)
    return apiError("Erro ao atualizar entrega", 500)
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser()
    if (!user) return apiError("Não autenticado", 401)

    const actor = actorFromUser(user)
    if (!canDeleteDelivery(actor)) {
      return apiError("Apenas administradores podem excluir entregas", 403)
    }

    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return apiError("Entrega inválida", 400)

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("deliveries")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle()

    if (error) return apiError(error.message, 400)
    if (!data) return apiError("Entrega não encontrada", 404)

    invalidateCampaignCache()
    return apiSuccess({ id })
  } catch (error) {
    console.error("DELETE /api/deliveries/[id] error:", error)
    return apiError("Erro ao excluir entrega", 500)
  }
}
