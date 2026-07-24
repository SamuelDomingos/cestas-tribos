/**
 * API client para o recurso de metas (goals).
 */

import type {
  GoalOutput,
  GoalCreateInput,
  GoalsAggregateOutput,
} from "@/lib/api/types/gcs.types"

/**
 * Lista metas, opcionalmente filtradas por GC ou tribo.
 */
export async function fetchGoals(opts?: {
  gcId?: string
  tribe?: string
}): Promise<GoalOutput[]> {
  const params = new URLSearchParams()
  if (opts?.gcId) params.set("gcId", opts.gcId)
  if (opts?.tribe) params.set("tribe", opts.tribe)
  const qs = params.toString()

  const res = await fetch(`/api/goals${qs ? `?${qs}` : ""}`)
  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao carregar metas")
  }

  return json.data
}

/**
 * Retorna o agregado de metas por tribo.
 */
export async function fetchGoalsAggregate(): Promise<GoalsAggregateOutput> {
  const res = await fetch("/api/goals?aggregate=true")
  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao carregar agregado de metas")
  }

  return json.data
}

/**
 * Cria uma nova meta.
 */
export async function createGoal(input: GoalCreateInput): Promise<GoalOutput> {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao criar meta")
  }

  return json.data
}
