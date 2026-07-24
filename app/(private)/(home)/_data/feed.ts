export interface FeedItem {
  id: string
  user: { name: string; initials: string }
  tribe: string
  date: string
  type: "Cesta Básica" | "Roupas"
  delivered: number
  goal: number
  photo: string
  gcName?: string
}
