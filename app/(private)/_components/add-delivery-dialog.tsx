"use client"

import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { PlusCircle, ShoppingBag, Shirt, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface GC {
  id: string
  name: string
  tribe: string
}

export function AddDeliveryDialog() {
  const [open, setOpen] = useState(false)
  const [userTribe, setUserTribe] = useState("")
  const [userRole, setUserRole] = useState("user")
  const [gcs, setGcs] = useState<GC[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [type, setType] = useState("BASKET")
  const [quantity, setQuantity] = useState("1")
  const [gcId, setGcId] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [notes, setNotes] = useState("")

  // Carrega dados do usuario e GCs ao abrir
  useEffect(() => {
    if (!open) return

    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      const meta = res.data?.user?.user_metadata || {}
      setUserTribe(meta.tribe || "")
      setUserRole(meta.role || "user")
    })

    setLoading(true)
    fetch("/api/gc")
      .then((r) => r.json())
      .then((data: GC[]) => {
        // Se for admin, mostra todos. Se não, filtra pela tribo do usuario
        const role = userRole // pode estar desatualizado, mas usamos o state
        setGcs(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Erro ao carregar GCs")
        setLoading(false)
      })
  }, [open])

  // Filtra GCs pela tribo do usuario
  const filteredGCs = userRole === "admin"
    ? gcs
    : gcs.filter((g) => g.tribe === userTribe)

  async function uploadPhoto(file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const fileName = `deliveries/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from("deliveries")
      .upload(fileName, file, { upsert: false })

    if (error) {
      console.error("Erro upload:", error)
      return null
    }

    const { data: urlData } = supabase.storage.from("deliveries").getPublicUrl(data.path)
    return urlData?.publicUrl ?? null
  }

  async function handleSubmit() {
    if (!gcId || !type) {
      toast.error("Selecione o tipo e o GC")
      return
    }

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
        setUploading(true)
        photoUrl = await uploadPhoto(photoFile)
        setUploading(false)
      }

      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          gcId,
          type,
          quantity: Number(quantity) || 1,
          photoUrl,
          notes: notes || null,
        }),
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      toast.success("Entrega registrada com sucesso!")
      setOpen(false)
      resetForm()
    } catch (e: any) {
      toast.error(e.message || "Erro ao registrar entrega")
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  function resetForm() {
    setType("BASKET")
    setQuantity("1")
    setGcId("")
    setPhotoFile(null)
    setNotes("")
  }

  const gcLabel = userRole === "admin" ? "GC (todas tribos)" : `GC (${userTribe})`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full justify-start gap-2" size="lg" />}>
        <PlusCircle className="size-4" />
        Adicionar Entrega
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Entrega</DialogTitle>
          <DialogDescription>
            Registre uma entrega de cesta ou roupa
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Tipo */}
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "BASKET" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setType("BASKET")}
              >
                <ShoppingBag className="size-4" />
                Cesta Básica
              </Button>
              <Button
                type="button"
                variant={type === "CLOTHES" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setType("CLOTHES")}
              >
                <Shirt className="size-4" />
                Roupas
              </Button>
            </div>
          </div>

          {/* Quantidade */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* GC */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="gc">{gcLabel}</Label>
            <Select value={gcId} onValueChange={(v) => setGcId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando..." : "Selecione o GC"} />
              </SelectTrigger>
              <SelectContent>
                {filteredGCs.map((gc) => (
                  <SelectItem key={gc.id} value={gc.id}>
                    {gc.name}
                    {userRole === "admin" && ` (${gc.tribe})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Foto */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="photo">Foto (opcional)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
            {photoFile && (
              <span className="text-xs text-muted-foreground">{photoFile.name}</span>
            )}
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Salvando..." : "Registrar Entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
