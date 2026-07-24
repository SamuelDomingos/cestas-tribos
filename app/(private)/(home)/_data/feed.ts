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
  type: "Cesta Básica" | "Roupas"
  delivered: number
  totalDeliveredBaskets: number
  totalDeliveredClothes: number
  photo: string
}
