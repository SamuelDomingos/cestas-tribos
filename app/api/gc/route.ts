import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const tribo = request.nextUrl.searchParams.get("tribo") || ""
    const supabase = createServiceClient()

    let query = supabase
      .from("gcs")
      .select("*, goals(*), deliveries(*)")
      .order("name", { ascending: true })

    if (tribo) {
      query = query.eq("tribe", tribo)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (erro) {
    console.error("Erro ao buscar GCs:", erro)
    return NextResponse.json({ error: "Erro ao buscar GCs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name")?.toString()
    const tribo = formData.get("tribo")?.toString()
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

    return NextResponse.json(data, { status: 201 })
  } catch (erro) {
    console.error("Erro ao criar GC:", erro)
    return NextResponse.json({ error: "Erro ao criar GC" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

    const formData = await request.formData()
    const name = formData.get("name")?.toString()
    const tribo = formData.get("tribo")?.toString()

    const updates: Record<string, string> = {}
    if (name) updates.name = name
    if (tribo) updates.tribe = tribo

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("gcs")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (erro) {
    console.error("Erro ao atualizar GC:", erro)
    return NextResponse.json({ error: "Erro ao atualizar GC" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

    const supabase = createServiceClient()
    const { error } = await supabase.from("gcs").delete().eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (erro) {
    console.error("Erro ao deletar GC:", erro)
    return NextResponse.json({ error: "Erro ao deletar GC" }, { status: 500 })
  }
}
