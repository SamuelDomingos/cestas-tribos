import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const gcId = request.nextUrl.searchParams.get("gcId")
    const tribe = request.nextUrl.searchParams.get("tribe")
    const aggregate = request.nextUrl.searchParams.get("aggregate")
    const supabase = createServiceClient()

    if (aggregate === "true") {
      const { data: gcs, error } = await supabase
        .from("gcs")
        .select("*, goals(*), deliveries(*)")

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }

      const tribesMap = new Map<string, any>()
      for (const gc of gcs || []) {
        const t = gc.tribe || "Sem tribo"
        if (!tribesMap.has(t)) {
          tribesMap.set(t, { tribe: t, gcCount: 0, basketGoal: 0, clothesGoal: 0, basketDel: 0, clothesDel: 0, gcs: [] })
        }
        const entry = tribesMap.get(t)
        entry.gcCount++
        const goal = gc.goals?.[0]
        entry.basketGoal += goal?.basketGoal ?? gc.basketGoal ?? 0
        entry.clothesGoal += goal?.clothesGoal ?? gc.clothesGoal ?? 0

        let gb = 0, gc_c = 0
        for (const d of gc.deliveries || []) {
          if (d.type === "BASKET") gb += d.quantity
          else gc_c += d.quantity
        }
        entry.basketDel += gb
        entry.clothesDel += gc_c

        entry.gcs.push({
          id: gc.id, name: gc.name, avatar: gc.avatar,
          basketGoal: goal?.basketGoal ?? gc.basketGoal ?? 0,
          clothesGoal: goal?.clothesGoal ?? gc.clothesGoal ?? 0,
          basketDel: gb, clothesDel: gc_c,
        })
      }

      const tribes = Array.from(tribesMap.values())
      const totals = tribes.reduce((acc, t) => ({
        basketGoal: acc.basketGoal + t.basketGoal,
        clothesGoal: acc.clothesGoal + t.clothesGoal,
        basketDel: acc.basketDel + t.basketDel,
        clothesDel: acc.clothesDel + t.clothesDel,
      }), { basketGoal: 0, clothesGoal: 0, basketDel: 0, clothesDel: 0 })

      return Response.json({ success: true, data: { tribes, totals } })
    }

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
    return Response.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("POST /api/goals error:", error)
    return Response.json({ success: false, error: "Erro ao criar meta" }, { status: 500 })
  }
}
