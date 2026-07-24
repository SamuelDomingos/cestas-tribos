import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { apiSuccess, apiError } from "@/lib/api/response"
import { TRIBE_CONFIG } from "@/lib/utils"

function formatUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at: string }) {
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    email: user.email ?? "—",
    name: meta.full_name ?? "—",
    role: meta.role ?? "user",
    tribe: meta.tribe ?? "",
    tribeName: TRIBE_CONFIG[meta.tribe as string]?.name ?? "—",
    createdAt: user.created_at,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { data, error } = await supabase.auth.admin.getUserById(id)

    if (error || !data?.user) {
      return apiError("Usuário não encontrado", 404)
    }

    return apiSuccess({ user: formatUser(data.user!) })
  } catch (error) {
    console.error("GET /api/users/[id] error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = createServiceClient()

    const metadata: Record<string, unknown> = {}
    if (body.name) metadata.full_name = body.name
    if (body.role) metadata.role = body.role
    if (body.tribe) metadata.tribe = body.tribe

    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: metadata,
    })

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess({ user: formatUser(data.user!) })
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess({ message: "Usuário removido com sucesso" })
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
