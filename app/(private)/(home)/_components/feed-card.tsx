import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Shirt, CalendarDays, Package } from "lucide-react"
import Image from "next/image"
import type { FeedItem } from "../_data/feed"
import { TRIBE_CONFIG } from "@/lib/utils"

export function FeedCard({ item }: { item: FeedItem }) {
  const hasPhoto = !!item.photo
  const tribeConfig = TRIBE_CONFIG[item.gc.tribe]
  const tribeImage = tribeConfig?.image ?? null
  const remainingBaskets = Math.max(
    item.gc.basketGoal - item.totalDeliveredBaskets,
    0
  )
  const remainingClothes = Math.max(
    item.gc.clothesGoal - item.totalDeliveredClothes,
    0
  )
  const basketsPct =
    item.gc.basketGoal > 0
      ? Math.min((item.totalDeliveredBaskets / item.gc.basketGoal) * 100, 100)
      : 0
  const clothesPct =
    item.gc.clothesGoal > 0
      ? Math.min((item.totalDeliveredClothes / item.gc.clothesGoal) * 100, 100)
      : 0

  return (
    <Card size="sm" className="overflow-hidden">
      {/* Cabeçalho — GC + Tribo */}
      <CardContent className="flex items-start gap-3 pt-(--card-spacing)">
        <Avatar size="lg" className="shrink-0">
          {item.gc.avatar ? (
            <AvatarImage src={item.gc.avatar} alt={item.gc.name} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
              {item.gc.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">
              {item.gc.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {tribeImage ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Avatar size="sm">
                  <AvatarImage src={tribeImage} alt={item.gc.tribe} />
                </Avatar>
                {item.gc.tribe}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Package className="size-3" />
                {item.gc.tribe}
              </span>
            )}

            <span className="ml-auto inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <CalendarDays className="size-3" />
              {item.date}
            </span>
          </div>
        </div>
      </CardContent>

      {/* O que foi doado */}
      <CardContent>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
          {item.type === "Cesta Básica" ? (
            <>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <ShoppingBag className="size-4 text-primary" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  Doou {item.delivered} cesta{item.delivered !== 1 ? "s" : ""}{" "}
                  básica{item.delivered !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {item.totalDeliveredBaskets} entregue
                  {item.totalDeliveredBaskets !== 1 ? "s" : ""} no total
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                <Shirt className="size-4 text-emerald-600" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  Doou {item.delivered}{" "}
                  {item.delivered !== 1 ? "peças" : "peça"} de roupa
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {item.totalDeliveredClothes} entregue
                  {item.totalDeliveredClothes !== 1 ? "s" : ""} no total
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Metas do GC — cards lado a lado */}
      {(item.gc.basketGoal > 0 || item.gc.clothesGoal > 0) && (
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {/* Meta de Cestas */}
            {item.gc.basketGoal > 0 && (
              <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-card p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  <ShoppingBag className="size-3 text-primary" />
                  Cestas
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      remainingBaskets === 0
                        ? "text-primary"
                        : remainingBaskets <= 3
                          ? "text-amber-500"
                          : "text-foreground"
                    }`}
                  >
                    {remainingBaskets}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {remainingBaskets === 1 ? "restante" : "restantes"}
                  </span>
                </div>
                <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(basketsPct, 2)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {item.totalDeliveredBaskets}/{item.gc.basketGoal}
                </span>
              </div>
            )}

            {/* Meta de Roupas */}
            {item.gc.clothesGoal > 0 && (
              <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-card p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  <Shirt className="size-3 text-emerald-600" />
                  Roupas
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      remainingClothes === 0
                        ? "text-emerald-600"
                        : remainingClothes <= 3
                          ? "text-amber-500"
                          : "text-foreground"
                    }`}
                  >
                    {remainingClothes}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {remainingClothes === 1 ? "restante" : "restantes"}
                  </span>
                </div>
                <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.max(clothesPct, 2)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {item.totalDeliveredClothes}/{item.gc.clothesGoal}
                </span>
              </div>
            )}
          </div>

          {/* Meta atingida! */}
          {remainingBaskets === 0 && remainingClothes === 0 && (
            <p className="mt-2 text-center text-[11px] font-medium text-primary">
              Todas as metas foram atingidas! 🎉
            </p>
          )}
        </CardContent>
      )}

      {/* Foto da entrega */}
      {hasPhoto && (
        <CardContent className="px-(--card-spacing) pb-(--card-spacing)">
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={item.photo}
              alt={`Entrega de ${item.type}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
