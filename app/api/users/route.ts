import { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { apiSuccess, apiError } from "@/lib/api/response"
import { TRIBE_CONFIG } from "@/lib/utils"

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers()

    if (authError) {
      return apiError("Erro ao buscar usuários", 500)
    }

    const users = authUsers.users.map((u) => {
      const meta = u.user_metadata || {}
      return {
        id: u.id,
        email: u.email ?? "—",
        name: meta.full_name ?? "—",
        role: meta.role ?? "user",
        tribe: meta.tribe ?? "",
        tribeName: TRIBE_CONFIG[meta.tribe as string]?.name ?? "—",
        createdAt: u.created_at,
      }
    })

    return apiSuccess({ users })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email || !body.password || !body.name || !body.tribe) {
      return apiError("Campos obrigatórios: email, password, name, tribe")
    }

    const validTribes = ["hope", "hazak", "sent"]
    if (!validTribes.includes(body.tribe)) {
      return apiError('Tribo inválida. Use: hope, hazak ou sent')
    }

    const role = body.role === "admin" ? "admin" : "user"

    const supabase = createServiceClient()

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        user_metadata: {
          full_name: body.name,
          tribe: body.tribe,
          role,
        },
        email_confirm: true,
      })

    if (authError) {
      return apiError(authError.message, 400)
    }

    const u = authData.user
    const meta = u.user_metadata || {}

    return apiSuccess(
      {
        user: {
          id: u.id,
          email: u.email,
          name: meta.full_name ?? body.name,
          role: meta.role ?? "user",
          tribe: meta.tribe ?? "",
          tribeName: TRIBE_CONFIG[meta.tribe as string]?.name ?? "—",
          createdAt: u.created_at,
        },
      },
      201,
    )
  } catch (error) {
    console.error("POST /api/users error:", error)
    return apiError("Erro interno do servidor", 500)
  }
}
