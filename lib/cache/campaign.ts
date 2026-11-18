import { revalidateTag, unstable_cache } from "next/cache"

import type { GCOutput, GoalsAggregateOutput } from "@/lib/api/types/gcs.types"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * Cache do servidor para os dados de campanha (agregado de metas e lista de GCs).
 *
 * As rotas de mutação chamam `invalidateCampaignCache()` para que a próxima
 * leitura seja fresca; o `revalidate` em segundos é só a rede de segurança
 * para escritas feitas fora da aplicação.
 */

/** Tag única: uma invalidação limpa o agregado e a lista de GCs juntos. */
const CAMPAIGN_TAG = "campaign-data"

/** Segundos até o agregado de metas revalidar sozinho. */
const AGGREGATE_REVALIDATE_SECONDS = 30

/** Segundos até a lista de GCs revalidar sozinha. */
const GCS_REVALIDATE_SECONDS = 60

type CacheResult<T> = { data: T | null; error: string | null }

/**
 * Lê o agregado de metas/entregas por tribo. As entregas entram apenas com
 * `type` e `quantity` — só o que as somas precisam — para não carregar
 * fotos e observações inteiros em cada leitura.
 */
const loadGoalsAggregate = unstable_cache(
  async (): Promise<CacheResult<GoalsAggregateOutput>> => {
    const supabase = createServiceClient()
    const { data: gcs, error } = await supabase
      .from("gcs")
      .select("*, goals(*), deliveries(type, quantity)")

    if (error) return { data: null, error: error.message }

    const tribesMap = new Map<string, TribeEntry>()
    type TribeEntry = {
      tribe: string
      gcCount: number
      basketGoal: number
      clothesGoal: number
      basketDel: number
      clothesDel: number
      gcs: Array<{
        id: string
        name: string
        avatar: string | null
        basketGoal: number
        clothesGoal: number
        basketDel: number
        clothesDel: number
      }>
    }
    for (const gc of gcs || []) {
      const t = gc.tribe || "Sem tribo"
      if (!tribesMap.has(t)) {
        tribesMap.set(t, { tribe: t, gcCount: 0, basketGoal: 0, clothesGoal: 0, basketDel: 0, clothesDel: 0, gcs: [] })
      }
      const entry = tribesMap.get(t)!
      entry.gcCount++
      const goal = gc.goals?.[0]
      entry.basketGoal += goal?.basketGoal ?? gc.basketGoal ?? 0
      entry.clothesGoal += goal?.clothesGoal ?? gc.clothesGoal ?? 0

      let gb = 0, gc_c = 0
      for (const d of gc.deliveries || []) {
        if (d.type === "BASKET") gb += d.quantity
        else gc_c += d.quantity
      }
      entry.basketDel += gb
      entry.clothesDel += gc_c

      entry.gcs.push({
        id: gc.id, name: gc.name, avatar: gc.avatar,
        basketGoal: goal?.basketGoal ?? gc.basketGoal ?? 0,
        clothesGoal: goal?.clothesGoal ?? gc.clothesGoal ?? 0,
        basketDel: gb, clothesDel: gc_c,
      })
    }

    const tribes = Array.from(tribesMap.values())
    const totals = tribes.reduce((acc, t) => ({
      basketGoal: acc.basketGoal + t.basketGoal,
      clothesGoal: acc.clothesGoal + t.clothesGoal,
      basketDel: acc.basketDel + t.basketDel,
      clothesDel: acc.clothesDel + t.clothesDel,
    }), { basketGoal: 0, clothesGoal: 0, basketDel: 0, clothesDel: 0 })

    return { data: { tribes, totals }, error: null }
  },
  ["goals-aggregate"],
  { tags: [CAMPAIGN_TAG], revalidate: AGGREGATE_REVALIDATE_SECONDS },
)

/**
 * Lista GCs com metas e somas de entregas. `tribe === ""` lista todos
 * (uso admin); caso contrário filtra pela tribo informada.
 */
const loadGcsList = unstable_cache(
  async (tribe: string): Promise<CacheResult<GCOutput[]>> => {
    const supabase = createServiceClient()
    let query = supabase
      .from("gcs")
      .select("*, goals(*), deliveries(type, quantity)")
      .order("name", { ascending: true })

    if (tribe) query = query.eq("tribe", tribe)

    const { data, error } = await query
    if (error) return { data: null, error: error.message }
    return { data: data || [], error: null }
  },
  ["gcs-list"],
  { tags: [CAMPAIGN_TAG], revalidate: GCS_REVALIDATE_SECONDS },
)

export function getGoalsAggregate() {
  return loadGoalsAggregate()
}

export function getGcsList(tribe: string) {
  return loadGcsList(tribe)
}

/**
 * Invalida os caches de campanha com bloqueio na próxima leitura
 * (`expire: 0`), para que o usuário veja a própria escrita em seguida.
 * Chamar sempre após uma mutação de entregas, GCs ou metas.
 */
export function invalidateCampaignCache() {
  revalidateTag(CAMPAIGN_TAG, { expire: 0 })
}
