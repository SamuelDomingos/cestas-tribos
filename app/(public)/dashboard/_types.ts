/** Dados de progresso de um GC para exibição pública */
export interface PublicGCProgress {
  id: string
  name: string
  avatar: string | null
  tribe: string
  basketDel: number
  basketGoal: number
  clothesDel: number
  clothesGoal: number
}

/** Dados de progresso de uma tribo */
export interface PublicTribeProgress {
  tribe: string
  gcCount: number
  basketDel: number
  basketGoal: number
  clothesDel: number
  clothesGoal: number
  pctBasket: number
  pctClothes: number
}

/** Agregado completo do painel */
export interface PublicCampaignData {
  totalBasketDel: number
  totalBasketGoal: number
  totalClothesDel: number
  totalClothesGoal: number
  totalPctBasket: number
  totalPctClothes: number
  tribes: PublicTribeProgress[]
  allGcs: PublicGCProgress[]
}
