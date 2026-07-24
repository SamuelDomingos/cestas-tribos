import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"
import { handleAvatarUpload } from "./avatarUpload.service"
import { editGcSchema } from "@/app/(private)/metas/_schemas/gc.schema"

export const GCService = {
  async createGC(formData: FormData) {
    try {
      const name = formData.get("name")?.toString()
      const avatarFile = formData.get("avatar") as File | null
      const tribo = formData.get("tribo")?.toString()

      if (!name || !tribo) {
        return { success: false, error: "Dados obrigatórios ausentes" }
      }

      const avatarPath = await handleAvatarUpload(avatarFile)

      const validatedData = editGcSchema.parse({
        name,
        avatar: avatarPath,
        tribe: tribo,
        basketGoal: 0,
        clothesGoal: 0,
      })

      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from("gcs")
        .insert({
          name: validatedData.name,
          avatar: validatedData.avatar ?? null,
          tribe: validatedData.tribe,
        })
        .select()
        .single()

      if (error) return { success: false, error: error.message }

      return { success: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Dados inválidos", details: error }
      }
      return { success: false, error: "Erro ao criar GC" }
    }
  },

  async getAllGCs(tribe: string) {
    try {
      const supabase = createServiceClient()

      let query = supabase
        .from("gcs")
        .select("*, goals(*), deliveries(*)")
        .order("name", { ascending: true })

      if (tribe) {
        query = query.eq("tribe", tribe)
      }

      const { data, error } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      console.error("Erro ao buscar GCs:", error)
      return { success: false, error: "Erro ao buscar GCs" }
    }
  },

  async updateGC(id: string, formData: FormData) {
    try {
      const name = formData.get("name")?.toString()
      const tribo = formData.get("tribo")?.toString()
      const avatarFile = formData.get("avatar") as File | null
      const basketGoal = formData.get("basketGoal")?.toString()
      const clothesGoal = formData.get("clothesGoal")?.toString()

      const avatarPath = await handleAvatarUpload(avatarFile)

      const updates: Record<string, string | number | null> = {}
      if (name) updates.name = name
      if (tribo) updates.tribe = tribo
      if (avatarPath !== undefined) updates.avatar = avatarPath
      if (basketGoal) updates.basketGoal = Number(basketGoal)
      if (clothesGoal) updates.clothesGoal = Number(clothesGoal)

      const supabase = createServiceClient()
      const { data, error } = await supabase
        .from("gcs")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) return { success: false, error: error.message }

      return { success: true, data }
    } catch (error) {
      console.log(error)
      return { success: false, error: "Erro ao atualizar GC" }
    }
  },

  async deleteGC(id: string) {
    try {
      const supabase = createServiceClient()
      const { error } = await supabase.from("gcs").delete().eq("id", id)

      if (error) return { success: false, error: error.message }

      return { success: true }
    } catch {
      return { success: false, error: "Erro ao deletar GC" }
    }
  },
}
