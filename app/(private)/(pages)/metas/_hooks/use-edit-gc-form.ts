"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { editGcSchema, type EditGCFormData } from "../_schemas/gc.schema"
import { useUpdateGC } from "./use-gcs"
import type { GCOutput } from "@/lib/api/types/gcs.types"

interface UseEditGCFormProps {
  gc: GCOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function useEditGCForm({ gc, open, onOpenChange }: UseEditGCFormProps) {
  const updateGC = useUpdateGC()

  const form = useForm<EditGCFormData>({
    resolver: zodResolver(editGcSchema),
    defaultValues: {
      name: "",
      tribe: "",
      avatar: "",
      basketGoal: 0,
      clothesGoal: 0,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: gc.name,
        tribe: gc.tribe,
        avatar: gc.avatar ?? "",
        // Já armazenado em centavos no banco
        basketGoal: gc.basketGoal ?? gc.goals?.[0]?.basketGoal ?? 0,
        clothesGoal: gc.clothesGoal ?? gc.goals?.[0]?.clothesGoal ?? 0,
      })
    }
  }, [open, gc, form])

  function onSubmit(data: EditGCFormData) {
    updateGC.mutate(
      {
        id: gc.id,
        name: data.name,
        tribo: data.tribe,
        avatar: data.avatar || null,
        // Já em centavos
        basketGoal: data.basketGoal,
        clothesGoal: data.clothesGoal,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return { form, isPending: updateGC.isPending, onSubmit }
}
