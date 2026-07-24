/**
 * Barrel export — import centralizado dos API clients e tipos.
 *
 * Uso:
 *   import { fetchGCs, fetchUsers, fetchDeliveries } from "@/lib/api"
 *   import type { GCOutput, UserOutput } from "@/lib/api"
 */

// API clients
export * from "./users"
export * from "./gcs"
export * from "./deliveries"
export * from "./goals"

// Tipos
export type { RegisterUserInput, UpdateUserInput, UserOutput } from "@/lib/api/types/users.types"
export type {
  GCOutput,
  GCCreateInput,
  GCUpdateInput,
  GoalOutput,
  GoalCreateInput,
  GoalWithGC,
  DeliveryOutput,
  DeliveryCreateInput,
  DeliveryType,
  TribeGoalSummary,
  GoalsAggregateOutput,
} from "@/lib/api/types/gcs.types"
