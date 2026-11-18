import { NextRequest } from "next/server"
import { getSessionUser, getUserRole } from "@/lib/auth"
import { getGoalsAggregate, invalidateCampaignCache } from "@/lib/cache/campaign"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return Response.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      )
    }

    const gcId = request.nextUrl.searchParams.get("gcId")
    const tribe = request.nextUrl.searchParams.get("tribe")
    const aggregate = request.nextUrl.searchParams.get("aggregate")

    if (aggregate === "true") {
      const { data, error } = await getGoalsAggregate()

      if (error) {
        return Response.json({ success: false, error }, { status: 500 })
      }

      return Response.json({ success: true, data })
    }

    const supabase = createServiceClient()
    let query = supabase.from("goals").select("*").order("createdAt", { ascending: false })
    if (gcId) query = query.eq("gcId", gcId)
    if (tribe) query = query.eq("tribe", tribe)

    const { data, error } = await query
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 })
    return Response.json({ success: true, data: data || [] })
  } catch (error) {
    console.error("GET /api/goals error:", error)
    return Response.json({ success: false, error: "Erro ao buscar metas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return Response.json(
        { success: false, error: "Não autenticado" },
        { status: 401 },
      )
    }
    if (getUserRole(user) !== "admin") {
      return Response.json(
        { success: false, error: "Apenas administradores podem criar metas" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("goals")
      .insert({
        gcId: body.gcId || null,
        tribe: body.tribe || null,
        basketGoal: body.basketGoal ?? 0,
        clothesGoal: body.clothesGoal ?? 0,
        deadline: body.deadline || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        createdById: body.createdById || null,
      })
      .select()
      .single()

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 })

    invalidateCampaignCache()
    return Response.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("POST /api/goals error:", error)
    return Response.json({ success: false, error: "Erro ao criar meta" }, { status: 500 })
  }
}
