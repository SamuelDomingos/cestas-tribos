"use client"

import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/lib/supabase/client"

export interface SessionUser {
  id: string
  name: string
  role: "admin" | "user"
  tribe: string
}

export function useSessionUser() {
  return useQuery({
    queryKey: ["session-user"],
    queryFn: async (): Promise<SessionUser> => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (error) throw error

      const user = data.user
      const meta = user?.user_metadata ?? {}

      return {
        id: user?.id ?? "",
        name:
          (typeof meta.full_name === "string" && meta.full_name) ||
          user?.email ||
          "",
        role: meta.role === "admin" ? "admin" : "user",
        tribe: typeof meta.tribe === "string" ? meta.tribe : "",
      }
    },
    staleTime: 60_000,
  })
}
