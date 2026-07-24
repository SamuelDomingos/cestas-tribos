"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchGoalsAggregate } from "@/lib/api"
import type { PublicCampaignData, PublicTribeProgress, PublicGCProgress } from "../_types"
import { TRIBE_ORDER } from "@/lib/utils"

/**
 * Hook que carrega os dados do painel da campanha e mantém atualização
 * em tempo real via Supabase Realtime + polling de fallback.
 */
export function useCampaignData() {
  const [data, setData] = useState<PublicCampaignData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  const buildCampaignData = useCallback((raw: Awaited<ReturnType<typeof fetchGoalsAggregate>>) => {
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
  }, [])

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const raw = await fetchGoalsAggregate()
      setData(buildCampaignData(raw))
    } catch (err) {
      console.error("Erro ao carregar dados da campanha:", err)
      setError("Não foi possível carregar os dados da campanha.")
    } finally {
      setIsLoading(false)
    }
  }, [buildCampaignData])

  useEffect(() => {
    loadData()

    // Configura inscrição em tempo real via Supabase Realtime
    const supabase = createClient()

    const channel = supabase
      .channel("campaign-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliveries" },
        () => loadData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gcs" },
        () => loadData(),
      )
      .subscribe()

    channelRef.current = channel

    // Polling de fallback a cada 30s
    const interval = setInterval(loadData, 30_000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [loadData])

  return { data, isLoading, error }
}
