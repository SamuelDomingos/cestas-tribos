"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  deleteDelivery,
  fetchMyDeliveries,
  updateDelivery,
} from "@/lib/api"
import type { DeliveryUpdateInput } from "@/lib/api"
import { useInvalidateCampaign } from "@/hooks/use-invalidate-campaign"

export function useMyDeliveries(isAdmin: boolean, enabled = true) {
  return useQuery({
    queryKey: ["my-deliveries", isAdmin],
    queryFn: () => fetchMyDeliveries(isAdmin),
    enabled,
  })
}

export function useUpdateDelivery() {
  const invalidate = useInvalidateCampaign()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DeliveryUpdateInput }) =>
      updateDelivery(id, input),
    onSuccess: () => {
      invalidate()
      toast.success("Entrega atualizada com sucesso!")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteDelivery() {
  const invalidate = useInvalidateCampaign()

  return useMutation({
    mutationFn: deleteDelivery,
    onSuccess: () => {
      invalidate()
      toast.success("Entrega excluída com sucesso!")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
