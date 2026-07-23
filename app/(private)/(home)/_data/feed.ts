export interface FeedItem {
  id: string
  user: { name: string; initials: string }
  tribe: string
  date: string
  type: "Cesta Básica" | "Roupas"
  delivered: number
  goal: number
  photo: string
}

export const feed: FeedItem[] = [
  {
    id: "1",
    user: { name: "Carlos Silva", initials: "CS" },
    tribe: "Tribo Jacareí",
    date: "22 Jul 2026",
    type: "Cesta Básica",
    delivered: 10,
    goal: 60,
    photo: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=600&fit=crop",
  },
  {
    id: "2",
    user: { name: "Ana Oliveira", initials: "AO" },
    tribe: "Tribo São José",
    date: "21 Jul 2026",
    type: "Roupas",
    delivered: 25,
    goal: 40,
    photo: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop",
  },
  {
    id: "3",
    user: { name: "Pedro Santos", initials: "PS" },
    tribe: "Tribo Taubaté",
    date: "20 Jul 2026",
    type: "Cesta Básica",
    delivered: 60,
    goal: 60,
    photo: "https://images.unsplash.com/photo-1593113630400-ea4288922497?w=600&h=600&fit=crop",
  },
  {
    id: "4",
    user: { name: "Maria Costa", initials: "MC" },
    tribe: "Tribo Jacareí",
    date: "19 Jul 2026",
    type: "Roupas",
    delivered: 12,
    goal: 30,
    photo: "https://images.unsplash.com/photo-1591228127791-8e2fef9e6fa8?w=600&h=600&fit=crop",
  },
]
