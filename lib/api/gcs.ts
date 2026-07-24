/**
 * API client para o recurso de GCs (Grupos de Crescimento).
 *
 * ATENÇÃO: os endpoints /api/gc retornam dados *diretamente* (sem envelope
 * `{ success, data }`), ao contrário de /api/users e /api/deliveries.
 * Lidamos com isso verificando `response.ok` em vez de `json.success`.
 */

import type {
  GCOutput,
  GCCreateInput,
  GCUpdateInput,
} from "@/lib/api/types/gcs.types"

/**
 * Lista todos os GCs, com metas e entregas agregadas.
 * @param tribo  Filtro opcional por tribo
 */
export async function fetchGCs(tribo?: string): Promise<GCOutput[]> {
  const params = tribo ? `?tribo=${encodeURIComponent(tribo)}` : ""
  const res = await fetch(`/api/gc${params}`)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || "Erro ao carregar GCs")
  }

  return res.json()
}

/**
 * Cria um novo GC.
 */
export async function createGC(input: GCCreateInput): Promise<GCOutput> {
  const formData = new FormData()
  formData.append("name", input.name)
  formData.append("tribo", input.tribo)
  if (input.avatar) formData.append("avatar", input.avatar)

  const res = await fetch("/api/gc", { method: "POST", body: formData })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || "Erro ao criar GC")
  }

  return res.json()
}

/**
 * Atualiza um GC existente.
 */
export async function updateGC(
  id: string,
  input: GCUpdateInput,
): Promise<GCOutput> {
  const formData = new FormData()
  if (input.name) formData.append("name", input.name)
  if (input.tribo) formData.append("tribo", input.tribo)
  if (input.avatar) formData.append("avatar", input.avatar)
  if (input.basketGoal !== undefined) formData.append("basketGoal", String(input.basketGoal))
  if (input.clothesGoal !== undefined) formData.append("clothesGoal", String(input.clothesGoal))

  const res = await fetch(`/api/gc?id=${encodeURIComponent(id)}`, {
    method: "PUT",
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || "Erro ao atualizar GC")
  }

  return res.json()
}

/**
 * Exclui um GC.
 */
export async function deleteGC(id: string): Promise<void> {
  const res = await fetch(`/api/gc?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || "Erro ao excluir GC")
  }
}
