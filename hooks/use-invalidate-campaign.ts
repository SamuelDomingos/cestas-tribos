"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Invalida as consultas que derivam de entregas, GCs e metas.
 * Chamar após qualquer mutação que altere esses dados (criar/editar/excluir
 * entrega, atualizar GC) — cobre listas, relatório, agregado e feed.
 */
export function useInvalidateCampaign() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["my-deliveries"] })
    void queryClient.invalidateQueries({ queryKey: ["deliveries"] })
    void queryClient.invalidateQueries({ queryKey: ["deliveries-report"] })
    void queryClient.invalidateQueries({ queryKey: ["goals-aggregate"] })
    void queryClient.invalidateQueries({ queryKey: ["gcs"] })
  }, [queryClient])
}
