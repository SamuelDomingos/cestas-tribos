"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FeedCard } from "./_components/feed-card"
import { AddDeliveryDialog } from "../_components/add-delivery-dialog"
import { ShoppingBag } from "lucide-react"
import { fetchDeliveries } from "@/lib/api"

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

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-lg space-y-6 pb-20 pt-6">
        {/* Header com resumo */}
        {deliveries.length > 0 && (
          <div className="px-4">
            <h1 className="text-sm font-semibold">Entregas Recentes</h1>
            <p className="text-xs text-muted-foreground">
              {userRole === "admin"
                ? "Todas as tribos"
                : `Tribo ${userTribe}`}
              {" — "}
              {deliveries.length} registro{deliveries.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground">
            <ShoppingBag className="size-10" />
            <p className="text-center">
              Nenhuma entrega registrada ainda.
            </p>
            <p className="text-center text-xs">
              Use o botão &ldquo;Adicionar Entrega&rdquo; no menu lateral.
            </p>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <FeedCard
              key={delivery.id}
              item={{
                id: delivery.id,
                user: {
                  name: delivery.memberId?.slice(0, 8) ?? "—",
                  initials: delivery.memberId?.slice(0, 2).toUpperCase() ?? "—",
                },
                tribe: delivery.gc?.tribe ?? "—",
                date: new Date(delivery.deliveredAt).toLocaleDateString("pt-BR"),
                type: delivery.type === "BASKET" ? "Cesta Básica" : "Roupas",
                delivered: delivery.quantity,
                goal: 0,
                photo: delivery.photoUrl ?? "",
                gcName: delivery.gc?.name ?? "—",
              }}
            />
          ))
        )}
      </div>

      {/* FAB mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <AddDeliveryDialog />
      </div>
    </ScrollArea>
  )
}
