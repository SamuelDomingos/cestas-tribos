import type { GCOutput } from "@/lib/api/types/gcs.types"

/** Alias para o tipo de retorno da API de GCs. */
export type GCData = GCOutput

/** Métricas calculadas de um GC. */
export interface GCStats {
  basketGoal: number
  clothesGoal: number
  basketDel: number
  clothesDel: number
}
