"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { fetchGoalsAggregate } from "@/lib/api"
import type { PublicCampaignData, PublicTribeProgress, PublicGCProgress } from "../_types"
import { TRIBE_ORDER } from "@/lib/utils"

/** Mesma chave usada pelo feed do admin — compartilham o cache bruto. */
const GOALS_AGGREGATE_KEY = ["goals-aggregate"] as const

const CAMPAIGN_ERROR = "Não foi possível carregar os dados da campanha."

function buildCampaignData(raw: Awaited<ReturnType<typeof fetchGoalsAggregate>>): PublicCampaignData {
  // Ordena tribos conforme TRIBE_ORDER
  const sortedTribes = TRIBE_ORDER
    .map((key) => raw.tribes.find((t) => t.tribe === key))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)

  // Achata todos os GCs em um array único
  const allGcs: PublicGCProgress[] = sortedTribes.flatMap((t) =>
    t.gcs.map((gc) => ({
      id: gc.id,
      name: gc.name,
      avatar: gc.avatar,
      tribe: t.tribe,
      basketDel: gc.basketDel,
      basketGoal: gc.basketGoal,
      clothesDel: gc.clothesDel,
      clothesGoal: gc.clothesGoal,
    })),
  )

  const tribes: PublicTribeProgress[] = sortedTribes.map((t) => ({
    tribe: t.tribe,
    gcCount: t.gcCount,
    basketDel: t.basketDel,
    basketGoal: t.basketGoal,
    clothesDel: t.clothesDel,
    clothesGoal: t.clothesGoal,
    pctBasket: t.basketGoal > 0 ? Math.round((t.basketDel / t.basketGoal) * 100) : 0,
    pctClothes: t.clothesGoal > 0 ? Math.round((t.clothesDel / t.clothesGoal) * 100) : 0,
  }))

  const totalPctBasket = raw.totals.basketGoal > 0
    ? Math.round((raw.totals.basketDel / raw.totals.basketGoal) * 100)
    : 0
  const totalPctClothes = raw.totals.clothesGoal > 0
    ? Math.round((raw.totals.clothesDel / raw.totals.clothesGoal) * 100)
    : 0

  return {
    totalBasketDel: raw.totals.basketDel,
    totalBasketGoal: raw.totals.basketGoal,
    totalClothesDel: raw.totals.clothesDel,
    totalClothesGoal: raw.totals.clothesGoal,
    totalPctBasket,
    totalPctClothes,
    tribes,
    allGcs,
  } satisfies PublicCampaignData
}

/**
 * Dados do painel público da campanha.
 *
 * - TanStack Query cuida do cache/dedupe; `select` deriva os dados exibidos
 *   sem reexecutar o fetch (structural sharing mantém referências estáveis).
 * - Polling de 30s é pausado automaticamente quando a aba fica oculta.
 * - Realtime só invalida a chave; o React Query refetcha uma única vez,
 *   mesmo com vários eventos em sequência.
 */
export function useCampaignData() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: GOALS_AGGREGATE_KEY,
    queryFn: fetchGoalsAggregate,
    select: buildCampaignData,
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: GOALS_AGGREGATE_KEY })
    }

    const supabase = createClient()
    const channel = supabase
      .channel("campaign-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliveries" },
        invalidate,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gcs" },
        invalidate,
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.isError ? CAMPAIGN_ERROR : null,
  }
}
