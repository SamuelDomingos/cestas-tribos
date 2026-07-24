"use client"

import Image from "next/image"
import { ShoppingBag, Shirt, CheckCircle2 } from "lucide-react"
import { TRIBE_CONFIG, calcStats, sumStats } from "../_data/hooks"
import { GCCard } from "./gc-card"
import type { GCData } from "../_data/hooks"

interface Props {
  tribeName: string
  gcs: GCData[]
  isAdmin: boolean
}

export function TribeSection({ tribeName, gcs, isAdmin }: Props) {
  const config = TRIBE_CONFIG[tribeName]
  const totals = sumStats(gcs.map(calcStats))
  const faltaBasket = Math.max(totals.basketGoal - totals.basketDel, 0)
  const faltaClothes = Math.max(totals.clothesGoal - totals.clothesDel, 0)

  return (
    <div className="space-y-3">
      {/* Cabeçalho da Tribo */}
      <div className="flex items-center gap-3">
        <div className="relative size-9 overflow-hidden rounded-full">
          <Image src={config.image} alt={tribeName} fill className="object-cover" />
        </div>
        <div className="flex flex-1 items-baseline gap-2">
          <span className="text-base font-bold">{config.name}</span>
          <span className="text-xs text-muted-foreground">
            {gcs.length} {gcs.length === 1 ? "GC" : "GCs"}
          </span>
        </div>
      </div>

      {/* Resumo da Tribo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><ShoppingBag className="size-3.5" /> Cestas</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{totals.basketDel}</span>
            <span className="text-sm text-muted-foreground">/ {totals.basketGoal}</span>
          </div>
          {faltaBasket > 0 ? (
            <p className="text-xs font-medium text-destructive">Falta {faltaBasket}</p>
          ) : (
            <p className="flex items-center gap-1 text-xs font-medium text-primary"><CheckCircle2 className="size-3.5" /> Completa</p>
          )}
        </div>
        <div className="rounded-lg border p-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Shirt className="size-3.5" /> Roupas</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{totals.clothesDel}</span>
            <span className="text-sm text-muted-foreground">/ {totals.clothesGoal}</span>
          </div>
          {faltaClothes > 0 ? (
            <p className="text-xs font-medium text-destructive">Falta {faltaClothes}</p>
          ) : (
            <p className="flex items-center gap-1 text-xs font-medium text-primary"><CheckCircle2 className="size-3.5" /> Completa</p>
          )}
        </div>
      </div>

      {/* Grid de GCs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gcs.map((gc) => (
          <GCCard key={gc.id} gc={gc} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}
