"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateGC } from "@/lib/api/gcs"
import { useQuery } from "@tanstack/react-query"
import { fetchGCs } from "@/lib/api/gcs"
import type { GCUpdateInput } from "@/lib/api/types/gcs.types"

export function useUpdateGC() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: GCUpdateInput & { id: string }) =>
      updateGC(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gcs-metas"] })
      toast.success("GC atualizado com sucesso!")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useMetas() {
  return useQuery({
    queryKey: ["gcs-metas"],
    queryFn: () => fetchGCs(),
  })
}
