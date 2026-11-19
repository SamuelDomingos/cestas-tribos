import { formatBasketValue } from "@/lib/utils"

export interface FeedItem {
  id: string
  user: { name: string; initials: string }
  gc: {
    name: string
    tribe: string
    avatar: string | null
    basketGoal: number
    clothesGoal: number
  }
  date: string
  deliveredAt: string
  type: "Cesta Básica" | "Roupas"
  delivered: number
  totalDeliveredBaskets: number
  totalDeliveredClothes: number
  photo: string
  notes: string | null
}

/** Valor formatado da entrega: cesta em reais, roupa em peças. */
export function feedItemValue(item: FeedItem): string {
  return item.type === "Cesta Básica"
    ? formatBasketValue(item.delivered)
    : `${item.delivered} ${item.delivered === 1 ? "peça" : "peças"}`
}
