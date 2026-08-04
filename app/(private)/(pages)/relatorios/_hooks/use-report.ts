"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchDeliveries, fetchGCs } from "@/lib/api"
import { useState, useMemo } from "react"
import type { DeliveryOutput } from "@/lib/api/types/gcs.types"

export function useReport() {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const fmt = (d: Date) => d.toISOString().split("T")[0]

  const [startDate, setStartDate] = useState(fmt(sevenDaysAgo))
  const [endDate, setEndDate] = useState(fmt(today))
  const [tribeFilter, setTribeFilter] = useState("all")

  const { data: allGcs = [] } = useQuery({
    queryKey: ["gcs-report"],
    queryFn: () => fetchGCs(),
  })

  // Lista de tribos disponíveis
  const tribes = useMemo(() => {
    const set = new Set(allGcs.map((g) => g.tribe))
    return Array.from(set).sort()
  }, [allGcs])

  // GCs filtrados pela tribo selecionada
  const filteredGcs = useMemo(() => {
    if (tribeFilter === "all") return allGcs
    return allGcs.filter((g) => g.tribe === tribeFilter)
  }, [allGcs, tribeFilter])

  const gcMap = useMemo(() => {
    const map = new Map<string, (typeof allGcs)[number]>()
    for (const gc of allGcs) map.set(gc.id, gc)
    return map
  }, [allGcs])

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries-report", startDate, endDate, tribeFilter],
    queryFn: () =>
      fetchDeliveries({
        startDate,
        endDate,
        tribe: tribeFilter === "all" ? undefined : tribeFilter,
        report: true,
      }),
  })

  // Fotos (deliveries que têm photoUrl)
  const photoDeliveries = useMemo(
    () => deliveries.filter((d) => d.photoUrl),
    [deliveries],
  )

  // Contagem resumida
  const summary = useMemo(() => {
    let baskets = 0
    let clothes = 0
    let totalPhotos = 0
    for (const d of deliveries) {
      if (d.type === "BASKET") baskets += d.quantity
      else clothes += d.quantity
      if (d.photoUrl) totalPhotos++
    }
    return { baskets, clothes, total: baskets + clothes, totalPhotos }
  }, [deliveries])

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    tribeFilter,
    setTribeFilter,
    tribes,
    filteredGcs,
    gcMap,
    deliveries,
    photoDeliveries,
    summary,
    isLoading,
  }
}
