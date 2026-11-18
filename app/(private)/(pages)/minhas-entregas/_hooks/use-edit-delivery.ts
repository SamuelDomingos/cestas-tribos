"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { fetchGCs, uploadDeliveryPhoto } from "@/lib/api"
import type { DeliveryOutput } from "@/lib/api"
import {
  editDeliverySchema,
  type EditDeliveryFormData,
} from "../_schemas/edit-delivery.schema"
import { useUpdateDelivery } from "./use-my-deliveries"

export function useEditDelivery({
  delivery,
  userTribe,
  isAdmin,
  open,
  onOpenChange,
}: {
  delivery: DeliveryOutput
  userTribe: string
  isAdmin: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [uploading, setUploading] = useState(false)
  const updateDelivery = useUpdateDelivery()

  const form = useForm<EditDeliveryFormData>({
    resolver: zodResolver(editDeliverySchema),
    defaultValues: {
      type: delivery.type,
      quantity: delivery.quantity,
      gcId: delivery.gcId,
      notes: delivery.notes ?? "",
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      type: delivery.type,
      quantity: delivery.quantity,
      gcId: delivery.gcId,
      photo: undefined,
      notes: delivery.notes ?? "",
    })
  }, [open, delivery, form])

  const { data: gcs = [] } = useQuery({
    queryKey: ["gcs"],
    queryFn: () => fetchGCs(),
    enabled: open,
  })

  const availableGCs = isAdmin
    ? gcs
    : gcs.filter((gc) => gc.tribe === userTribe)

  const photoFile = form.watch("photo")
  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  )

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  async function onSubmit(data: EditDeliveryFormData) {
    setUploading(true)

    try {
      let photoUrl = delivery.photoUrl

      if (data.photo) {
        const uploaded = await uploadDeliveryPhoto(data.photo)

        if (!uploaded) {
          toast.error("Falha ao enviar a foto do comprovante")
          return
        }

        photoUrl = uploaded
      }

      if (!photoUrl) {
        toast.error("Envie a foto do comprovante")
        return
      }

      await updateDelivery.mutateAsync({
        id: delivery.id,
        input: {
          type: data.type,
          quantity: data.quantity,
          gcId: data.gcId,
          photoUrl,
          notes: data.notes?.trim() ? data.notes.trim() : null,
        },
      })

      onOpenChange(false)
    } catch {
      // O erro da mutação já é exibido por useUpdateDelivery.
    } finally {
      setUploading(false)
    }
  }

  return {
    form,
    gcs,
    availableGCs,
    photoPreview,
    uploading,
    isPending: uploading || updateDelivery.isPending,
    onSubmit,
  }
}
