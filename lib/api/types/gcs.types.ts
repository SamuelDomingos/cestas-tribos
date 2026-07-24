/**
 * Tipos de entrada/saída para os recursos de GCs, Metas e Entregas.
 */

// ─── GC ───────────────────────────────────────────────────────────────────────

export interface GCOutput {
  id: string
  name: string
  avatar: string | null
  tribe: string
  basketGoal: number
  clothesGoal: number
  goals: GoalOutput[]
  deliveries: DeliveryOutput[]
}

export interface GCCreateInput {
  name: string
  /** Nome do campo usado no FormData ("tribo"). */
  tribo: string
  avatar?: string | null
}

export interface GCUpdateInput {
  /** Nome do campo usado no FormData ("tribo"). */
  tribo?: string
  name?: string
  avatar?: string | null
  basketGoal?: number
  clothesGoal?: number
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export interface GoalOutput {
  id: string
  gcId: string | null
  tribe: string | null
  basketGoal: number
  clothesGoal: number
  deadline: string
  isActive: boolean
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface GoalCreateInput {
  gcId?: string | null
  tribe?: string | null
  basketGoal: number
  clothesGoal: number
  deadline?: string
  createdById?: string | null
}

export interface GoalWithGC extends GoalOutput {
  gc: Pick<GCOutput, "id" | "name" | "tribe"> | null
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export type DeliveryType = "BASKET" | "CLOTHES"

export interface DeliveryOutput {
  id: string
  memberId: string
  gcId: string
  type: DeliveryType
  quantity: number
  photoUrl: string | null
  notes: string | null
  deliveredAt: string
  createdAt: string
  gc: Pick<GCOutput, "id" | "name" | "tribe"> | null
}

export interface DeliveryCreateInput {
  memberId: string
  gcId: string
  type: DeliveryType
  quantity?: number
  photoUrl?: string | null
  notes?: string | null
}

// ─── Aggregated (from /api/goals?aggregate=true) ──────────────────────────────

export interface TribeGoalSummary {
  tribe: string
  gcCount: number
  basketGoal: number
  clothesGoal: number
  basketDel: number
  clothesDel: number
  gcs: Array<{
    id: string
    name: string
    avatar: string | null
    basketGoal: number
    clothesGoal: number
    basketDel: number
    clothesDel: number
  }>
}

export interface GoalsAggregateOutput {
  tribes: TribeGoalSummary[]
  totals: {
    basketGoal: number
    clothesGoal: number
    basketDel: number
    clothesDel: number
  }
}
