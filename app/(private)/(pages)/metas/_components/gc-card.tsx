"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Shirt, CheckCircle2 } from "lucide-react"
import { EditGCDialog } from "./edit-gc-dialog"
import { calcStats } from "../_data/utils"
import type { GCData } from "../_data/types"
import { TRIBE_CONFIG, formatBasketValue } from "@/lib/utils"

export function GCCard({ gc, isAdmin }: { gc: GCData; isAdmin: boolean }) {
  const c = calcStats(gc)
  const config = TRIBE_CONFIG[gc.tribe]
  const faltaBasket = Math.max(c.basketGoal - c.basketDel, 0)
  const faltaClothes = Math.max(c.clothesGoal - c.clothesDel, 0)

  return (
    <Card size="sm" className="relative">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={gc.avatar ?? undefined} alt={gc.name} />
              <AvatarFallback className="text-xs">{gc.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-semibold">{gc.name}</span>
              {config && (
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {config.name}
                </span>
              )}
            </div>
          </div>
          {isAdmin && <EditGCDialog gc={gc} />}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Cestas */}
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><ShoppingBag className="size-3" /> Cestas</span>
            <div className="mt-1 space-y-0.5">
              <p className="text-lg font-bold tabular-nums">{formatBasketValue(c.basketDel)}</p>
              <p className="text-xs text-muted-foreground">
                Meta: <span className="font-medium text-foreground">{formatBasketValue(c.basketGoal)}</span>
              </p>
              {faltaBasket > 0 ? (
                <p className="text-xs font-medium text-destructive">Falta {formatBasketValue(faltaBasket)}</p>
              ) : (
                <p className="flex items-center gap-1 text-xs font-medium"><CheckCircle2 className="size-3.5" /> Completa</p>
              )}
            </div>
          </div>

          {/* Roupas */}
          <div className="rounded-lg bg-muted/30 p-3">
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><Shirt className="size-3" /> Roupas</span>
            <div className="mt-1 space-y-0.5">
              <p className="text-lg font-bold tabular-nums">{c.clothesDel}</p>
              <p className="text-xs text-muted-foreground">
                Meta: <span className="font-medium text-foreground">{c.clothesGoal}</span>
              </p>
              {faltaClothes > 0 ? (
                <p className="text-xs font-medium text-destructive">Falta {faltaClothes}</p>
              ) : (
                <p className="flex items-center gap-1 text-xs font-medium"><CheckCircle2 className="size-3.5" /> Completa</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
