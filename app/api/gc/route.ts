import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { getGcsList, invalidateCampaignCache } from "@/lib/cache/campaign"
import {
  actorFromUser,
  canReadTribe,
  isAdmin,
} from "@/lib/deliveries/authorization"
import { createServiceClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  if (!isAdmin(actorFromUser(user))) {
    return NextResponse.json(
      { error: "Apenas administradores podem alterar GCs" },
      { status: 403 },
    )
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const actor = actorFromUser(user)
    const tribo = request.nextUrl.searchParams.get("tribo") || ""

    if (!isAdmin(actor) && tribo && !canReadTribe(actor, tribo)) {
      return NextResponse.json(
        { error: "Você só pode acessar GCs da sua tribo" },
        { status: 403 },
      )
    }

    if (!isAdmin(actor) && !tribo && !actor.tribe) {
      return NextResponse.json([])
    }

    // "" lista todos (admin); usuário comum fica restrito à própria tribo.
    const tribeFilter = isAdmin(actor) ? tribo : tribo || actor.tribe || ""
    const { data, error } = await getGcsList(tribeFilter)

    if (error) {
      console.error("Erro Supabase:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (erro) {
    console.error("Erro ao buscar GCs:", erro)
    return NextResponse.json({ error: "Erro ao buscar GCs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const forbidden = await requireAdmin()
    if (forbidden) return forbidden

    const formData = await request.formData()
    const name = formData.get("name")?.toString()
    const tribo = formData.get("tribe")?.toString()
    const avatar = formData.get("avatar")?.toString() || null

    if (!name || !tribo) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("gcs")
      .insert({ name, tribe: tribo, avatar })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    invalidateCampaignCache()
    return NextResponse.json(data, { status: 201 })
  } catch (erro) {
    console.error("Erro ao criar GC:", erro)
    return NextResponse.json({ error: "Erro ao criar GC" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const forbidden = await requireAdmin()
    if (forbidden) return forbidden

    const id = request.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

    const formData = await request.formData()
    const name = formData.get("name")?.toString()
    const tribo = formData.get("tribe")?.toString()
    const basketGoal = formData.get("basketGoal")?.toString()
    const clothesGoal = formData.get("clothesGoal")?.toString()

    const updates: Record<string, string | number> = {}
    if (name) updates.name = name
    if (tribo) updates.tribe = tribo
    if (basketGoal !== undefined) updates.basketGoal = Number(basketGoal)
    if (clothesGoal !== undefined) updates.clothesGoal = Number(clothesGoal)

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("gcs")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    invalidateCampaignCache()
    return NextResponse.json(data)
  } catch (erro) {
    console.error("Erro ao atualizar GC:", erro)
    return NextResponse.json({ error: "Erro ao atualizar GC" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const forbidden = await requireAdmin()
    if (forbidden) return forbidden

    const id = request.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase.from("gcs").delete().eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    invalidateCampaignCache()
    return NextResponse.json({ success: true })
  } catch (erro) {
    console.error("Erro ao deletar GC:", erro)
    return NextResponse.json({ error: "Erro ao deletar GC" }, { status: 500 })
  }
}
