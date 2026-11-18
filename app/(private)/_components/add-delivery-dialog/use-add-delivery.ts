"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { fetchGCs, createDelivery, uploadDeliveryPhoto } from "@/lib/api"
import type { GCOutput } from "@/lib/api"
import { useInvalidateCampaign } from "@/hooks/use-invalidate-campaign"
import { useSessionUser } from "@/hooks/use-session-user"
import { deliverySchema, type DeliveryFormData } from "./delivery.schema"

export interface UseAddDeliveryReturn {
  open: boolean
  setOpen: (open: boolean) => void
  userTribe: string
  userRole: string
  gcs: GCOutput[]
  filteredGCs: GCOutput[]
  selectedGC: GCOutput | null
  saving: boolean
  photoFile: File | null
  setPhotoFile: (file: File | null) => void
  photoPreviewUrl: string | null
  form: ReturnType<typeof useForm<DeliveryFormData>>
  onSubmit: (data: DeliveryFormData) => Promise<void>
  gcLabel: string
}

export function useAddDelivery(): UseAddDeliveryReturn {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const session = useSessionUser()
  const invalidate = useInvalidateCampaign()

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      type: "BASKET",
      quantity: 3500,
      gcId: "",
      notes: "",
    },
  })

  // Reseta o formulário ao abrir/fechar o dialog
  useEffect(() => {
    if (!open) return

    form.reset({
      type: "BASKET",
      quantity: 3500,
      gcId: "",
      notes: "",
    })
    setPhotoFile(null)
  }, [open, form])

  // GCs compartilham o cache ["gcs"] com as demais telas; busca só ao abrir
  const gcsQuery = useQuery({
    queryKey: ["gcs"],
    queryFn: () => fetchGCs(),
    enabled: open,
  })

  useEffect(() => {
    if (gcsQuery.isError) toast.error("Erro ao carregar GCs")
  }, [gcsQuery.isError])

  const userTribe = session.data?.tribe ?? ""
  const userRole: string = session.data?.role ?? "user"

  // Filtra GCs pela tribo do usuario
  const filteredGCs = userRole === "admin"
    ? gcsQuery.data ?? []
    : (gcsQuery.data ?? []).filter((g) => g.tribe === userTribe)

  const gcId = form.watch("gcId")
  const selectedGC = gcId ? filteredGCs.find((g) => g.id === gcId) ?? null : null

  const photoPreviewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  )

  const onSubmit = useCallback(async (data: DeliveryFormData) => {
    setSaving(true)
    try {
      // Foto obrigatória — validada pelo schema do formulário
      const photoUrl = await uploadDeliveryPhoto(data.photo)

      if (!photoUrl) {
        throw new Error("Falha ao enviar a foto do comprovante")
      }

      await createDelivery({
        gcId: data.gcId,
        type: data.type,
        quantity: data.quantity,
        photoUrl,
        notes: data.notes || null,
      })

      toast.success("Entrega registrada com sucesso!")
      invalidate()
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar entrega")
    } finally {
      setSaving(false)
    }
  }, [invalidate])

  const gcLabel = userRole === "admin" ? "GC (todas tribos)" : `GC (${userTribe})`

  return {
    open,
    setOpen,
    userTribe,
    userRole,
    gcs: gcsQuery.data ?? [],
    filteredGCs,
    selectedGC,
    saving,
    photoFile,
    setPhotoFile,
    photoPreviewUrl,
    form,
    onSubmit,
    gcLabel,
  }
}
