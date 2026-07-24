"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShoppingBag, Shirt, Trophy, CheckCircle2, Users } from "lucide-react"
import { TRIBE_CONFIG } from "@/lib/utils"

/** Converte centavos em quantidade de cestas (1 cesta = R$ 35 = 3500 centavos) */
function toBaskets(cents: number) {
  return Math.floor(cents / 3500)
}
import type { PublicGCProgress } from "../_types"
import { useMemo } from "react"

interface GcsTabProps {
  allGcs: PublicGCProgress[]
}

const POSITION_STYLES = [
  { border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", icon: "text-amber-500", label: "1º" },
  { border: "border-slate-300", bg: "bg-slate-50 dark:bg-slate-900/30", icon: "text-slate-400", label: "2º" },
  { border: "border-orange-300", bg: "bg-orange-50 dark:bg-orange-950/20", icon: "text-orange-400", label: "3º" },
]

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden bg-muted">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

function GCRankingCard({
  position,
  gc,
  pct,
  delivered,
  goal,
  type,
}: {
  position: number
  gc: PublicGCProgress
  pct: number
  delivered: number
  goal: number
  type: "basket" | "clothes"
}) {
  const fmtDel = type === "basket" ? toBaskets(delivered) : delivered
  const fmtGoal = type === "basket" ? toBaskets(goal) : goal
  const style = POSITION_STYLES[position] ?? POSITION_STYLES[POSITION_STYLES.length - 1]
  const barColor = type === "basket" ? "bg-primary" : "bg-emerald-500"
  const config = TRIBE_CONFIG[gc.tribe]

  return (
    <div className={`border-2 ${style.border} ${style.bg} p-3`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-8 shrink-0 items-center justify-center bg-background text-sm font-bold ${style.icon}`}>
          {style.label}
        </div>

        <Avatar className="size-9 border-2 border-background">
          <AvatarImage src={gc.avatar ?? undefined} alt={gc.name} />
          <AvatarFallback className="text-xs">{gc.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate">{gc.name}</span>
            {config && (
              <span className="shrink-0 bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {config.name}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{fmtDel}/{fmtGoal}</span>
            <span className="font-medium tabular-nums">{pct}%</span>
          </div>
          <Bar pct={pct} color={barColor} />
        </div>
      </div>
    </div>
  )
}

function GCListItem({ gc }: { gc: PublicGCProgress }) {
  const config = TRIBE_CONFIG[gc.tribe]
  const basketPct = gc.basketGoal > 0 ? Math.round((gc.basketDel / gc.basketGoal) * 100) : 0
  const clothesPct = gc.clothesGoal > 0 ? Math.round((gc.clothesDel / gc.clothesGoal) * 100) : 0
  const basketComplete = basketPct >= 100
  const clothesComplete = clothesPct >= 100
  const isComplete = basketComplete || clothesComplete

  return (
    <div
      className={`border p-4 transition-colors ${
        isComplete
          ? "border-amber-400 bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10"
          : "bg-card hover:bg-accent/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarImage src={gc.avatar ?? undefined} alt={gc.name} />
          <AvatarFallback className="text-xs">
            <Users className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{gc.name}</span>
            {config && (
              <span className="bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {config.name}
              </span>
            )}
            {isComplete && (
              <CheckCircle2 className="size-4 text-amber-500 shrink-0" />
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            {/* Cestas */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><ShoppingBag className="size-3" /> Cestas</span>
                <span className={basketComplete ? "font-bold text-amber-600 dark:text-amber-400" : ""}>
                  {toBaskets(gc.basketDel)} / {toBaskets(gc.basketGoal)} ({basketPct}%)
                </span>
              </div>
              <Bar
                pct={basketPct}
                color={basketComplete ? "bg-amber-500" : "bg-primary"}
              />
            </div>

            {/* Roupas */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Shirt className="size-3" /> Roupas</span>
                <span className={clothesComplete ? "font-bold text-amber-600 dark:text-amber-400" : ""}>
                  {gc.clothesDel}/{gc.clothesGoal} ({clothesPct}%)
                </span>
              </div>
              <Bar
                pct={clothesPct}
                color={clothesComplete ? "bg-amber-500" : "bg-emerald-500"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GcsTab({ allGcs }: GcsTabProps) {
  const topBaskets = useMemo(
    () =>
      [...allGcs]
        .sort((a, b) => {
          const pctA = a.basketGoal > 0 ? a.basketDel / a.basketGoal : 0
          const pctB = b.basketGoal > 0 ? b.basketDel / b.basketGoal : 0
          return pctB - pctA
        })
        .slice(0, 3),
    [allGcs],
  )

  const topClothes = useMemo(
    () =>
      [...allGcs]
        .sort((a, b) => {
          const pctA = a.clothesGoal > 0 ? a.clothesDel / a.clothesGoal : 0
          const pctB = b.clothesGoal > 0 ? b.clothesDel / b.clothesGoal : 0
          return pctB - pctA
        })
        .slice(0, 3),
    [allGcs],
  )

  const sortedGcs = useMemo(() => [...allGcs].sort((a, b) => a.name.localeCompare(b.name)), [allGcs])

  if (allGcs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed px-6 py-16 text-center">
        <Trophy className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Nenhum GC cadastrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top 3 Cestas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2">
            <ShoppingBag className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Top 3 GCs — Cestas</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {topBaskets.map((gc, idx) => {
            const pct = gc.basketGoal > 0 ? Math.round((gc.basketDel / gc.basketGoal) * 100) : 0
            return (
              <GCRankingCard
                key={`basket-${gc.id}`}
                position={idx}
                gc={gc}
                pct={pct}
                delivered={gc.basketDel}
                goal={gc.basketGoal}
                type="basket"
              />
            )
          })}
        </div>
      </div>

      {/* Top 3 Roupas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2">
            <Shirt className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold">Top 3 GCs — Roupas</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {topClothes.map((gc, idx) => {
            const pct = gc.clothesGoal > 0 ? Math.round((gc.clothesDel / gc.clothesGoal) * 100) : 0
            return (
              <GCRankingCard
                key={`clothes-${gc.id}`}
                position={idx}
                gc={gc}
                pct={pct}
                delivered={gc.clothesDel}
                goal={gc.clothesGoal}
                type="clothes"
              />
            )
          })}
        </div>
      </div>

      {/* Lista completa de GCs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Todos os GCs</h3>
          <span className="text-xs text-muted-foreground">({sortedGcs.length})</span>
        </div>

        <div className="space-y-2">
          {sortedGcs.map((gc) => (
            <GCListItem key={gc.id} gc={gc} />
          ))}
        </div>
      </div>
    </div>
  )
}
