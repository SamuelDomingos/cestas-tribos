"use client"

import { useQuery } from "@tanstack/react-query"

export interface GCData {
  id: string
  name: string
  tribe: string
  avatar: string | null
  basketGoal?: number
  clothesGoal?: number
  goals: Array<{ basketGoal: number; clothesGoal: number }>
  deliveries: Array<{ type: "BASKET" | "CLOTHES"; quantity: number }>
}

export interface GCStats {
  basketGoal: number
  clothesGoal: number
  basketDel: number
  clothesDel: number
}

async function fetchGCs(): Promise<GCData[]> {
  const res = await fetch("/api/gc")
  if (!res.ok) throw new Error("Erro ao carregar GCs")
  return res.json()
}

export function calcStats(gc: GCData): GCStats {
  const goal = gc.goals?.[0]
  return {
    basketGoal: gc.basketGoal ?? goal?.basketGoal ?? 0,
    clothesGoal: gc.clothesGoal ?? goal?.clothesGoal ?? 0,
    basketDel: gc.deliveries?.filter((d) => d.type === "BASKET").reduce((s, d) => s + d.quantity, 0) ?? 0,
    clothesDel: gc.deliveries?.filter((d) => d.type === "CLOTHES").reduce((s, d) => s + d.quantity, 0) ?? 0,
  }
}

export function sumStats(stats: GCStats[]): GCStats {
  return stats.reduce(
    (acc, s) => ({
      basketGoal: acc.basketGoal + s.basketGoal,
      clothesGoal: acc.clothesGoal + s.clothesGoal,
      basketDel: acc.basketDel + s.basketDel,
      clothesDel: acc.clothesDel + s.clothesDel,
    }),
    { basketGoal: 0, clothesGoal: 0, basketDel: 0, clothesDel: 0 },
  )
}

export function useMetas() {
  return useQuery({
    queryKey: ["gcs-metas"],
    queryFn: fetchGCs,
  })
}

export const TRIBE_ORDER = ["hope", "hazak", "sent"]

export const TRIBE_CONFIG: Record<string, { name: string; image: string }> = {
  hope: { name: "Hope", image: "/tribos/hope.jpeg" },
  hazak: { name: "Hazak", image: "/tribos/hazak.jpeg" },
  sent: { name: "Sent", image: "/tribos/sent.jpeg" },
}
