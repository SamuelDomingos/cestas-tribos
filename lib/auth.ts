import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export type UserRole = "admin" | "user"

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) return null
  return data.user ?? null
}

export function getUserRole(user: User | null): UserRole {
  return user?.user_metadata?.role === "admin" ? "admin" : "user"
}

export function getUserTribe(user: User | null): string | null {
  const tribe = user?.user_metadata?.tribe
  return typeof tribe === "string" && tribe.length > 0 ? tribe : null
}
