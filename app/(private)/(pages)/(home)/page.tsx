"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FeedCard } from "./_components/feed-card"
import { TribeCharts } from "./_components/tribe-charts"
import { ShoppingBag } from "lucide-react"
import { fetchDeliveries, fetchGoalsAggregate } from "@/lib/api"

export default function HomeFeed() {
  const [userTribe, setUserTribe] = useState("")
  const [userRole, setUserRole] = useState("user")

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const meta = data?.user?.user_metadata ?? {}
      setUserTribe((meta.tribe as string) || "")
      setUserRole((meta.role as string) || "user")
    })()
  }, [])

  const tribeFilter = userRole === "admin" ? undefined : userTribe

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries", tribeFilter],
    queryFn: () => fetchDeliveries({ tribe: tribeFilter }),
    enabled: !!userRole,
  })

  const { data: aggregate } = useQuery({
    queryKey: ["goals-aggregate"],
    queryFn: fetchGoalsAggregate,
    enabled: userRole === "admin",
  })

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

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto space-y-6 pt-6 pb-20">
        {userRole === "admin" && aggregate && aggregate.tribes.length > 0 && (
          <div className="space-y-3 px-4 gap-4">
            <h2 className="text-sm font-semibold">Progresso das Tribos</h2>
            <TribeCharts data={aggregate} />
          </div>
        )}

        {deliveries.length > 0 && (
          <div className="px-4">
            <h1 className="text-sm font-semibold">Entregas Recentes</h1>
            <p className="text-xs text-muted-foreground">
              {userRole === "admin" ? "Todas as tribos" : `Tribo ${userTribe}`}
              {" — "}
              {deliveries.length} registro{deliveries.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground">
              <ShoppingBag className="size-10" />
              <p className="text-center">Nenhuma entrega registrada ainda.</p>
              <p className="text-center text-xs">
                Use o botão &ldquo;Adicionar Entrega&rdquo; no menu lateral.
              </p>
            </div>
          ) : (
            deliveries.map((delivery) => {
              const totals = delivery.gc ? gcTotals.get(delivery.gc.id) : null
              return (
                <FeedCard
                  key={delivery.id}
                  item={{
                    id: delivery.id,
                    user: {
                      name:
                        delivery.memberName ??
                        delivery.memberId?.slice(0, 8) ??
                        "—",
                      initials:
                        delivery.memberId?.slice(0, 2).toUpperCase() ?? "—",
                    },
                    gc: {
                      name: delivery.gc?.name ?? "—",
                      tribe: delivery.gc?.tribe ?? "—",
                      avatar: delivery.gc?.avatar ?? null,
                      basketGoal: delivery.gc?.basketGoal ?? 0,
                      clothesGoal: delivery.gc?.clothesGoal ?? 0,
                    },
                    date: new Date(delivery.deliveredAt).toLocaleDateString(
                      "pt-BR"
                    ),
                    type:
                      delivery.type === "BASKET" ? "Cesta Básica" : "Roupas",
                    delivered: delivery.quantity,
                    totalDeliveredBaskets: totals?.baskets ?? 0,
                    totalDeliveredClothes: totals?.clothes ?? 0,
                    photo: delivery.photoUrl ?? "",
                  }}
                />
              )
            })
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
