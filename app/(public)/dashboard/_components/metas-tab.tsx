"use client"

import { ShoppingBag, Shirt, CheckCircle2 } from "lucide-react"

/** Converte centavos em quantidade de cestas (1 cesta = R$ 35 = 3500 centavos) */
function toBaskets(cents: number) {
  return Math.floor(cents / 3500)
}

interface MetasTabProps {
  basketDel: number
  basketGoal: number
  clothesDel: number
  clothesGoal: number
  pctBasket: number
  pctClothes: number
}

export function MetasTab({ basketDel, basketGoal, clothesDel, clothesGoal, pctBasket, pctClothes }: MetasTabProps) {
  const faltaBasket = Math.max(basketGoal - basketDel, 0)
  const faltaClothes = Math.max(clothesGoal - clothesDel, 0)

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Card Cestas */}
      <div className="border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary/10 p-3">
            <ShoppingBag className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold">Cestas Básicas</h3>
            <p className="text-xs text-muted-foreground">Meta da campanha</p>
          </div>
        </div>

        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums">{toBaskets(basketDel)}</span>
          <span className="text-sm text-muted-foreground">/ {toBaskets(basketGoal)}</span>
        </div>

        <div className="mb-2">
          <div className="h-3 w-full overflow-hidden bg-muted">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: `${Math.min(pctBasket, 100)}%` }}
            />
          </div>
          <span className="mt-1 block text-sm font-medium">{pctBasket}%</span>
        </div>

        {faltaBasket > 0 ? (
          <p className="mt-3 text-sm font-medium text-destructive">
            Faltam {toBaskets(faltaBasket)} {toBaskets(faltaBasket) === 1 ? "cesta" : "cestas"}
          </p>
        ) : (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 className="size-4" />
            Meta de cestas completa!
          </p>
        )}
      </div>

      {/* Card Roupas */}
      <div className="border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-emerald-500/10 p-3">
            <Shirt className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold">Roupas</h3>
            <p className="text-xs text-muted-foreground">Meta da campanha</p>
          </div>
        </div>

        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums">{clothesDel}</span>
          <span className="text-sm text-muted-foreground">/ {clothesGoal}</span>
        </div>

        <div className="mb-2">
          <div className="h-3 w-full overflow-hidden bg-muted">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(pctClothes, 100)}%` }}
            />
          </div>
          <span className="mt-1 block text-sm font-medium">{pctClothes}%</span>
        </div>

        {faltaClothes > 0 ? (
          <p className="mt-3 text-sm font-medium text-destructive">
            Faltam {faltaClothes} {faltaClothes === 1 ? "peça" : "peças"}
          </p>
        ) : (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 className="size-4" />
            Meta de roupas completa!
          </p>
        )}
      </div>
    </div>
  )
}
