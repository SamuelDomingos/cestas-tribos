"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FeedCard } from "./_components/feed-card"
import { TribeCharts } from "./_components/tribe-charts"
import { PhotoDialog } from "./_components/photo-dialog"
import { LayoutGrid, LayoutList, ShoppingBag, ImageOff, ZoomIn } from "lucide-react"
import { fetchDeliveries, fetchGoalsAggregate } from "@/lib/api"
import { useSessionUser } from "@/hooks/use-session-user"
import { feedItemValue, type FeedItem } from "./_data/feed"

type ViewMode = "feed" | "grid"

export default function HomeFeed() {
  const session = useSessionUser()
  const userTribe = session.data?.tribe ?? ""
  const userRole = session.data?.role ?? "user"

  const tribeFilter = userRole === "admin" ? undefined : userTribe

  const deliveriesQuery = useQuery({
    queryKey: ["deliveries", tribeFilter],
    queryFn: () => fetchDeliveries({ tribe: tribeFilter }),
    // Busca só depois que a sessão resolve (evita fetch com tribo vazia)
    enabled: !session.isPending,
  })
  const deliveries = useMemo(
    () => deliveriesQuery.data ?? [],
    [deliveriesQuery.data],
  )

  const { data: aggregate } = useQuery({
    queryKey: ["goals-aggregate"],
    queryFn: fetchGoalsAggregate,
    enabled: userRole === "admin",
  })

  const isLoading = session.isPending || deliveriesQuery.isPending

  // Agrupa totais por GC + tipo para calcular o progresso
  const gcTotals = useMemo(() => {
    const map = new Map<string, { baskets: number; clothes: number }>()
    for (const d of deliveries) {
      if (!d.gc) continue
      const key = d.gc.id
      const prev = map.get(key) ?? { baskets: 0, clothes: 0 }
      if (d.type === "BASKET") prev.baskets += d.quantity
      else prev.clothes += d.quantity
      map.set(key, prev)
    }
    return map
  }, [deliveries])

  const feedItems: FeedItem[] = useMemo(
    () =>
      deliveries.map((delivery) => {
        const totals = delivery.gc ? gcTotals.get(delivery.gc.id) : null
        return {
          id: delivery.id,
          user: {
            name:
              delivery.memberName ??
              delivery.memberId?.slice(0, 8) ??
              "—",
            initials: delivery.memberId?.slice(0, 2).toUpperCase() ?? "—",
          },
          gc: {
            name: delivery.gc?.name ?? "—",
            tribe: delivery.gc?.tribe ?? "—",
            avatar: delivery.gc?.avatar ?? null,
            basketGoal: delivery.gc?.basketGoal ?? 0,
            clothesGoal: delivery.gc?.clothesGoal ?? 0,
          },
          date: new Date(delivery.deliveredAt).toLocaleDateString("pt-BR"),
          deliveredAt: delivery.deliveredAt,
          type: delivery.type === "BASKET" ? "Cesta Básica" : "Roupas",
          delivered: delivery.quantity,
          totalDeliveredBaskets: totals?.baskets ?? 0,
          totalDeliveredClothes: totals?.clothes ?? 0,
          photo: delivery.photoUrl ?? "",
          notes: delivery.notes,
        }
      }),
    [deliveries, gcTotals],
  )

  const [view, setView] = useState<ViewMode>("feed")
  const [selected, setSelected] = useState<FeedItem | null>(null)

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto space-y-6 pt-6 pb-20">
        {userRole === "admin" && aggregate && aggregate.tribes.length > 0 && (
          <div className="space-y-3 px-4 gap-4">
            <h2 className="text-sm font-semibold">Progresso das Tribos</h2>
            <TribeCharts data={aggregate} />
          </div>
        )}

        {feedItems.length > 0 && (
          <div className="flex items-end justify-between gap-3 px-4">
            <div>
              <h1 className="text-sm font-semibold">Entregas Recentes</h1>
              <p className="text-xs text-muted-foreground">
                {userRole === "admin" ? "Todas as tribos" : `Tribo ${userTribe}`}
                {" — "}
                {feedItems.length} registro{feedItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ToggleGroup
              value={view}
              onValueChange={setView}
              aria-label="Formato de visualização"
            >
              <ToggleGroupItem value="feed" aria-label="Visualização em feed">
                <LayoutList />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Visualização em grade">
                <LayoutGrid />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground">
            <ShoppingBag className="size-10" />
            <p className="text-center">Nenhuma entrega registrada ainda.</p>
            <p className="text-center text-xs">
              Use o botão &ldquo;Adicionar Entrega&rdquo; no menu lateral.
            </p>
          </div>
        ) : view === "feed" ? (
          <div className="max-w-lg mx-auto">
            {feedItems.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onPhotoClick={() => setSelected(item)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-4">
            {feedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                aria-label={`Abrir detalhes da entrega de ${item.user.name}`}
                className="group/tile overflow-hidden rounded-md border bg-card text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring/50"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {item.photo ? (
                    <>
                      <Image
                        src={item.photo}
                        alt={`Comprovante de ${item.user.name}`}
                        fill
                        className="object-cover transition-transform group-hover/tile:scale-[1.04]"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <span className="absolute top-1.5 right-1.5 rounded-md bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100">
                        <ZoomIn className="size-3.5" />
                      </span>
                    </>
                  ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <ImageOff className="size-6" />
                      <span className="text-[10px]">Sem foto</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 p-2">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {feedItemValue(item)}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {item.user.name} · {item.date}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <PhotoDialog
        item={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </ScrollArea>
  )
}
