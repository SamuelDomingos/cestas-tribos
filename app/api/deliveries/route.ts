import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const gcId = request.nextUrl.searchParams.get("gcId")
    const tribe = request.nextUrl.searchParams.get("tribe")
    const startDate = request.nextUrl.searchParams.get("startDate")
    const endDate = request.nextUrl.searchParams.get("endDate")
    const limitParam = request.nextUrl.searchParams.get("limit")
    const isReport = request.nextUrl.searchParams.get("report") === "true"
    const supabase = createServiceClient()

    let query = supabase
      .from("deliveries")
      .select("*, gc:gcs(id, name, tribe, avatar, basketGoal, clothesGoal)")
      .order("deliveredAt", { ascending: false })

    // Limite padrão 50, exceto para relatórios
    if (!isReport) {
      const limit = limitParam ? parseInt(limitParam, 10) : 50
      if (!isNaN(limit)) query = query.limit(limit)
    }

    if (gcId) query = query.eq("gcId", gcId)
    if (tribe) {
      const { data: gcs } = await supabase.from("gcs").select("id").eq("tribe", tribe)
      const ids = gcs?.map(g => g.id) || []
      query = query.in("gcId", ids)
    }
    if (startDate) {
      query = query.gte("deliveredAt", new Date(startDate).toISOString())
    }
    if (endDate) {
      query = query.lte("deliveredAt", new Date(endDate + "T23:59:59").toISOString())
    }

    const { data, error } = await query
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 })
    return Response.json({ success: true, data: data || [] })
  } catch (error) {
    console.error("GET /api/deliveries error:", error)
    return Response.json({ success: false, error: "Erro ao buscar entregas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.memberId || !body.gcId || !body.type) {
      return Response.json({ success: false, error: "Campos obrigatórios: memberId, gcId, type" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("deliveries")
      .insert({
        id: crypto.randomUUID(),
        memberId: body.memberId,
        gcId: body.gcId,
        type: body.type,
        quantity: body.quantity ?? 1,
        photoUrl: body.photoUrl || null,
        notes: body.notes || null,
      })
      .select("*, gc:gcs(id, name, tribe, avatar, basketGoal, clothesGoal)")
      .single()

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 })
    return Response.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("POST /api/deliveries error:", error)
    return Response.json({ success: false, error: "Erro ao registrar entrega" }, { status: 500 })
  }
}
