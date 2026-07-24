"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, ShoppingBag, Shirt, CheckCircle2 } from "lucide-react"
import type { GCStats } from "../_data/hooks"

interface Props {
  totals: GCStats
}

export function MetasOverview({ totals }: Props) {
  const faltaBasket = Math.max(totals.basketGoal - totals.basketDel, 0)
  const faltaClothes = Math.max(totals.clothesGoal - totals.clothesDel, 0)

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="size-5" />
          <span className="text-sm font-semibold">Metas Gerais — Todas as Tribos</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-background/60 p-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><ShoppingBag className="size-3.5" /> Cestas</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{totals.basketDel}</span>
              <span className="text-sm text-muted-foreground">/ {totals.basketGoal}</span>
            </div>
            {faltaBasket > 0 ? (
              <p className="mt-1 text-xs font-medium text-destructive">Falta {faltaBasket} cestas</p>
            ) : (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium"><CheckCircle2 className="size-3.5 text-primary" /> Todas completaram cestas!</p>
            )}
          </div>
          <div className="rounded-lg bg-background/60 p-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Shirt className="size-3.5" /> Roupas</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{totals.clothesDel}</span>
              <span className="text-sm text-muted-foreground">/ {totals.clothesGoal}</span>
            </div>
            {faltaClothes > 0 ? (
              <p className="mt-1 text-xs font-medium text-destructive">Falta {faltaClothes} roupas</p>
            ) : (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium"><CheckCircle2 className="size-3.5 text-primary" /> Todas completaram roupas!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
