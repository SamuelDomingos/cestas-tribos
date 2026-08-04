import type { GCData, GCStats } from "./types"

export function calcStats(gc: GCData): GCStats {
  const goal = gc.goals?.[0]
  return {
    basketGoal: gc.basketGoal ?? goal?.basketGoal ?? 0,
    clothesGoal: gc.clothesGoal ?? goal?.clothesGoal ?? 0,
    basketDel:
      gc.deliveries
        ?.filter((d) => d.type === "BASKET")
        .reduce((s, d) => s + d.quantity, 0) ?? 0,
    clothesDel:
      gc.deliveries
        ?.filter((d) => d.type === "CLOTHES")
        .reduce((s, d) => s + d.quantity, 0) ?? 0,
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
