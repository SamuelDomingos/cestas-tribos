import { NextRequest } from "next/server"

import { apiError, apiSuccess } from "@/lib/api/response"
import { getSessionUser } from "@/lib/auth"
import { invalidateCampaignCache } from "@/lib/cache/campaign"
import {
  actorFromUser,
  canReadTribe,
  canUseGC,
  isAdmin,
} from "@/lib/deliveries/authorization"
import {
  DEFAULT_LIMIT,
  DELIVERY_SELECT,
  MAX_LIST_LIMIT,
  MAX_REPORT_LIMIT,
} from "@/lib/deliveries/constants"
import { deliveryCreateSchema } from "@/lib/deliveries/schema"
import { createServiceClient } from "@/lib/supabase/server"

function toIsoDate(value: string, endOfDay = false) {
  const date = new Date(endOfDay ? `${value}T23:59:59` : value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

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

async function gcIdsForTribe(
  supabase: ReturnType<typeof createServiceClient>,
  tribe: string,
) {
  const { data, error } = await supabase
    .from("gcs")
    .select("id")
    .eq("tribe", tribe)

  if (error) throw error
  return (data ?? []).map((gc) => gc.id)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return apiError("Não autenticado", 401)

    const actor = actorFromUser(user)
    const params = request.nextUrl.searchParams
    const gcId = params.get("gcId")
    const tribe = params.get("tribe")
    const startDate = params.get("startDate")
    const endDate = params.get("endDate")
    const limitParam = params.get("limit")
    const mine = params.get("mine") === "true"
    const all = params.get("all") === "true"
    const report = params.get("report") === "true"

    if (all && !isAdmin(actor)) {
      return apiError("Apenas administradores podem listar todas as entregas", 403)
    }

    const startIso = startDate ? toIsoDate(startDate) : null
    if (startDate && !startIso) return apiError("Data inicial inválida", 400)

    const endIso = endDate ? toIsoDate(endDate, true) : null
    if (endDate && !endIso) return apiError("Data final inválida", 400)

    if (!mine && !all && !isAdmin(actor) && tribe) {
      if (!canReadTribe(actor, tribe)) {
        return apiError("Você só pode acessar entregas da sua tribo", 403)
      }
    }

    const supabase = createServiceClient()
    let query = supabase
      .from("deliveries")
      .select(DELIVERY_SELECT)
      .order("deliveredAt", { ascending: false })

    if (mine) {
      query = query.eq("memberId", actor.id)
    } else if (!all && !isAdmin(actor)) {
      const effectiveTribe = tribe ?? actor.tribe

      if (!effectiveTribe) {
        query = query.eq("memberId", actor.id)
      } else {
        const ids = await gcIdsForTribe(supabase, effectiveTribe)

        if (gcId && !ids.includes(gcId)) {
          return apiError("GC fora da sua tribo", 403)
        }
        if (ids.length === 0) return apiSuccess([])

        query = query.in("gcId", ids)
      }
    } else if (tribe) {
      const ids = await gcIdsForTribe(supabase, tribe)

      if (gcId && !ids.includes(gcId)) return apiSuccess([])
      if (ids.length === 0) return apiSuccess([])

      query = query.in("gcId", ids)
    }

    if (gcId) query = query.eq("gcId", gcId)
    if (startIso) query = query.gte("deliveredAt", startIso)
    if (endIso) query = query.lte("deliveredAt", endIso)

    const requestedLimit = limitParam ? Number.parseInt(limitParam, 10) : NaN
    const maxLimit = report ? MAX_REPORT_LIMIT : MAX_LIST_LIMIT
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), maxLimit)
      : report
        ? MAX_REPORT_LIMIT
        : DEFAULT_LIMIT

    query = query.limit(limit)

    const { data, error } = await query
    if (error) return apiError(error.message, 500)

    return apiSuccess(data ?? [])
  } catch (error) {
    console.error("GET /api/deliveries error:", error)
    return apiError("Erro ao buscar entregas", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return apiError("Não autenticado", 401)

    const body = await request.json().catch(() => null)
    const parsed = deliveryCreateSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos", 400)
    }

    const actor = actorFromUser(user)
    const supabase = createServiceClient()
    const gc = await findGC(supabase, parsed.data.gcId)

    if (!gc) return apiError("GC não encontrado", 404)
    if (!canUseGC(actor, gc.tribe)) {
      return apiError("Você só pode registrar entregas na sua tribo", 403)
    }

    const { data, error } = await supabase
      .from("deliveries")
      .insert({
        id: crypto.randomUUID(),
        memberId: actor.id,
        gcId: parsed.data.gcId,
        type: parsed.data.type,
        quantity: parsed.data.quantity,
        photoUrl: parsed.data.photoUrl,
        notes: parsed.data.notes ?? null,
      })
      .select(DELIVERY_SELECT)
      .single()

    if (error) return apiError(error.message, 400)

    invalidateCampaignCache()
    return apiSuccess(data, 201)
  } catch (error) {
    console.error("POST /api/deliveries error:", error)
    return apiError("Erro ao registrar entrega", 500)
  }
}
