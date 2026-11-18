"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { updateGC } from "@/lib/api/gcs"
import { fetchGCs } from "@/lib/api/gcs"
import type { GCUpdateInput } from "@/lib/api/types/gcs.types"
import { useInvalidateCampaign } from "@/hooks/use-invalidate-campaign"

export function useUpdateGC() {
  const invalidate = useInvalidateCampaign()

  return useMutation({
    mutationFn: ({ id, ...input }: GCUpdateInput & { id: string }) =>
      updateGC(id, input),
    onSuccess: () => {
      invalidate()
      toast.success("GC atualizado com sucesso!")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useMetas() {
  return useQuery({
    queryKey: ["gcs"],
    queryFn: () => fetchGCs(),
  })
}
