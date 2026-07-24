"use client"

import Image from "next/image"
import { ShoppingBag, Shirt, Trophy } from "lucide-react"
import { TRIBE_CONFIG } from "@/lib/utils"

/** Converte centavos em quantidade de cestas (1 cesta = R$ 35 = 3500 centavos) */
function toBaskets(cents: number) {
  return Math.floor(cents / 3500)
}
import type { PublicTribeProgress } from "../_types"

interface TribosTabProps {
  tribes: PublicTribeProgress[]
}

const POSITION_STYLES = [
  { border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", icon: "text-amber-500", label: "1º" },
  { border: "border-slate-300", bg: "bg-slate-50 dark:bg-slate-900/30", icon: "text-slate-400", label: "2º" },
  { border: "border-orange-300", bg: "bg-orange-50 dark:bg-orange-950/20", icon: "text-orange-400", label: "3º" },
]

function RankingCard({
  position,
  tribe,
  pct,
  delivered,
  goal,
  type,
}: {
  position: number
  tribe: PublicTribeProgress
  pct: number
  delivered: number
  goal: number
  type: "basket" | "clothes"
}) {
  const config = TRIBE_CONFIG[tribe.tribe]
  const style = POSITION_STYLES[position] ?? POSITION_STYLES[POSITION_STYLES.length - 1]
  const barColor = type === "basket" ? "bg-primary" : "bg-emerald-500"

  return (
    <div className={`border-2 ${style.border} ${style.bg} p-4 transition-colors`}>
      <div className="flex items-center gap-4">
        {/* Posição */}
        <div className={`flex size-10 shrink-0 items-center justify-center bg-background font-bold text-lg ${style.icon}`}>
          {style.label}
        </div>

        {/* Avatar tribo */}
        <div className="relative size-12 shrink-0 overflow-hidden border-2 border-background shadow-sm">
          {config ? (
            <Image src={config.image} alt={tribe.tribe} fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted font-bold text-muted-foreground">
              {tribe.tribe.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h4 className="text-sm font-bold capitalize">{tribe.tribe}</h4>
            <span className="text-xs text-muted-foreground">{tribe.gcCount} GCs</span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{type === "basket" ? `${toBaskets(delivered)} / ${toBaskets(goal)}` : `${delivered}/${goal}`}</span>
              <span className="font-medium tabular-nums">{pct}%</span>
            </div>
            <div className="mt-0.5 h-2 w-full overflow-hidden bg-muted">
              <div
                className={`h-full ${barColor} transition-all duration-700`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TribosTab({ tribes }: TribosTabProps) {
  const basketRanking = [...tribes].sort((a, b) => b.pctBasket - a.pctBasket)
  const clothesRanking = [...tribes].sort((a, b) => b.pctClothes - a.pctClothes)

  if (tribes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed px-6 py-16 text-center">
        <Trophy className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Nenhuma tribo cadastrada ainda.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Ranking Cestas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2">
            <ShoppingBag className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Ranking Cestas</h3>
        </div>

        <div className="space-y-3">
          {basketRanking.map((tribe, idx) => (
            <RankingCard
              key={tribe.tribe}
              position={idx}
              tribe={tribe}
              pct={tribe.pctBasket}
              delivered={tribe.basketDel}
              goal={tribe.basketGoal}
              type="basket"
            />
          ))}
        </div>
      </div>

      {/* Ranking Roupas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2">
            <Shirt className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold">Ranking Roupas</h3>
        </div>

        <div className="space-y-3">
          {clothesRanking.map((tribe, idx) => (
            <RankingCard
              key={tribe.tribe}
              position={idx}
              tribe={tribe}
              pct={tribe.pctClothes}
              delivered={tribe.clothesDel}
              goal={tribe.clothesGoal}
              type="clothes"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
