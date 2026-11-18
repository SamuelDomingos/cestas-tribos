"use client"

import { Package } from "lucide-react"

import { useSessionUser } from "@/hooks/use-session-user"

import { DeliveryCard } from "./_components/delivery-card"
import {
  useDeleteDelivery,
  useMyDeliveries,
} from "./_hooks/use-my-deliveries"

export default function MyDeliveriesPage() {
  const { data: session, isLoading: isLoadingSession } = useSessionUser()
  const isAdmin = session?.role === "admin"
  const {
    data: deliveries = [],
    isLoading,
    isError,
  } = useMyDeliveries(!!isAdmin, !!session?.id)
  const deleteDelivery = useDeleteDelivery()

  function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja excluir esta entrega?")) {
      deleteDelivery.mutate(id)
    }
  }

  const loading = isLoadingSession || isLoading

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-lg font-bold tracking-tight">
          {isAdmin ? "Todas as entregas" : "Minhas entregas"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Como administrador, você pode excluir qualquer entrega."
            : "Você pode editar as entregas que registrou."}
        </p>
      </div>

      {loading && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Carregando entregas...
        </p>
      )}

      {isError && !loading && (
        <div className="border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Erro ao carregar entregas. Tente novamente.
        </div>
      )}

      {!loading && !isError && deliveries.length === 0 && (
        <div className="flex flex-col items-center gap-3 border border-dashed py-16 text-center text-sm text-muted-foreground">
          <Package className="size-10 text-muted-foreground/50" />
          <p>Nenhuma entrega encontrada.</p>
          <p className="text-xs">
            Use o botão “Adicionar Entrega” para registrar a primeira.
          </p>
        </div>
      )}

      {!loading && !isError && deliveries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {deliveries.length} registro
            {deliveries.length !== 1 ? "s" : ""}
          </p>

          {deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              canEdit={delivery.memberId === session?.id}
              canDelete={!!isAdmin}
              isAdmin={!!isAdmin}
              userTribe={session?.tribe ?? ""}
              onDelete={() => handleDelete(delivery.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
