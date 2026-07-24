"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { fetchGCs, createDelivery, uploadDeliveryPhoto } from "@/lib/api"
import type { GCOutput } from "@/lib/api"
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
  const [userTribe, setUserTribe] = useState("")
  const [userRole, setUserRole] = useState("user")
  const [gcs, setGcs] = useState<GCOutput[]>([])
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const router = useRouter()

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      type: "BASKET",
      quantity: 1,
      gcId: "",
      notes: "",
    },
  })

  // Reseta o formulário ao abrir/fechar o dialog
  useEffect(() => {
    if (!open) return

    form.reset({
      type: "BASKET",
      quantity: 1,
      gcId: "",
      notes: "",
    })
    setPhotoFile(null)
  }, [open, form])

  // Carrega dados do usuario e GCs ao abrir
  useEffect(() => {
    if (!open) return

    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const meta = data?.user?.user_metadata ?? {}
      setUserTribe((meta.tribe as string) || "")
      setUserRole((meta.role as string) || "user")
    })()

    fetchGCs()
      .then((data) => setGcs(data))
      .catch(() => toast.error("Erro ao carregar GCs"))
  }, [open])

  // Filtra GCs pela tribo do usuario
  const filteredGCs = userRole === "admin"
    ? gcs
    : gcs.filter((g) => g.tribe === userTribe)

  const gcId = form.watch("gcId")
  const selectedGC = gcId ? filteredGCs.find((g) => g.id === gcId) ?? null : null

  const photoPreviewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  )

  const onSubmit = useCallback(async (data: DeliveryFormData) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const getusr = await supabase.auth.getUser()
      const memberId = getusr.data?.user?.id

      if (!memberId) {
        toast.error("Usuário não autenticado")
        return
      }

      // Upload da foto se tiver
      let photoUrl: string | null = null
      if (photoFile) {
        photoUrl = await uploadDeliveryPhoto(photoFile)
      }

      await createDelivery({
        memberId,
        gcId: data.gcId,
        type: data.type,
        quantity: data.quantity,
        photoUrl: photoUrl ?? null,
        notes: data.notes || null,
      })

      toast.success("Entrega registrada com sucesso!")
      router.refresh()
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao registrar entrega")
    } finally {
      setSaving(false)
    }
  }, [photoFile, router])

  const gcLabel = userRole === "admin" ? "GC (todas tribos)" : `GC (${userTribe})`

  return {
    open,
    setOpen,
    userTribe,
    userRole,
    gcs,
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
