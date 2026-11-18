"use client"

import { Calendar, Shirt, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { DeliveryOutput } from "@/lib/api"
import {
  TRIBE_CONFIG,
  formatBasketValue,
} from "@/lib/utils"

import { EditDeliveryDialog } from "./edit-delivery-dialog"

export function DeliveryCard({
  delivery,
  canEdit,
  canDelete,
  isAdmin,
  userTribe,
  onDelete,
}: {
  delivery: DeliveryOutput
  canEdit: boolean
  canDelete: boolean
  isAdmin: boolean
  userTribe: string
  onDelete: () => void
}) {
  const isBasket = delivery.type === "BASKET"
  const tribeName =
    TRIBE_CONFIG[delivery.gc?.tribe ?? ""]?.name ?? delivery.gc?.tribe ?? "—"

  return (
    <Card size="sm">
      <CardContent className="flex gap-3 p-4">
        {delivery.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={delivery.photoUrl}
            alt="Comprovante da entrega"
            className="size-20 shrink-0 border object-cover"
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center border bg-muted/40 text-muted-foreground">
            {isBasket ? (
              <ShoppingBag className="size-6" />
            ) : (
              <Shirt className="size-6" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            {isBasket ? (
              <ShoppingBag className="size-4 text-primary" />
            ) : (
              <Shirt className="size-4 text-emerald-600" />
            )}
            {isBasket
              ? formatBasketValue(delivery.quantity)
              : `Roupa x${delivery.quantity}`}
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {delivery.gc?.name ?? "GC removido"} · {tribeName}
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {new Date(delivery.deliveredAt).toLocaleDateString("pt-BR")}
          </p>

          {isAdmin && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Membro: {delivery.memberId.slice(0, 8)}
            </p>
          )}

          {delivery.notes && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {delivery.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          {canEdit && (
            <EditDeliveryDialog
              delivery={delivery}
              userTribe={userTribe}
              isAdmin={isAdmin}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label="Excluir entrega"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
