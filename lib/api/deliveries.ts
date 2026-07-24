/**
 * API client para o recurso de entregas.
 */

import { createClient } from "@/lib/supabase/client"
import type { DeliveryOutput, DeliveryCreateInput } from "@/lib/api/types/gcs.types"

/**
 * Lista entregas, opcionalmente filtradas por GC ou tribo.
 */
export async function fetchDeliveries(opts?: {
  gcId?: string
  tribe?: string
}): Promise<DeliveryOutput[]> {
  const params = new URLSearchParams()
  if (opts?.gcId) params.set("gcId", opts.gcId)
  if (opts?.tribe) params.set("tribe", opts.tribe)
  const qs = params.toString()

  const res = await fetch(`/api/deliveries${qs ? `?${qs}` : ""}`)
  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao carregar entregas")
  }

  return json.data
}

/**
 * Registra uma nova entrega.
 */
export async function createDelivery(input: DeliveryCreateInput): Promise<DeliveryOutput> {
  const res = await fetch("/api/deliveries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao registrar entrega")
  }

  return json.data
}

/**
 * Faz upload de uma foto para o bucket "deliveries" no Supabase Storage.
 * Retorna a URL pública ou null em caso de erro.
 */
export async function uploadDeliveryPhoto(file: File): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split(".").pop()
  const fileName = `deliveries/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from("deliveries")
    .upload(fileName, file, { upsert: false })

  if (error) {
    console.error("Erro upload:", error)
    return null
  }

  const { data: urlData } = supabase.storage.from("deliveries").getPublicUrl(data.path)
  return urlData?.publicUrl ?? null
}
