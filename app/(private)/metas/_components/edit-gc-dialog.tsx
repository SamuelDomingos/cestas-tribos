"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import type { GCData } from "../_data/hooks"
import { TRIBE_CONFIG } from "../_data/hooks"

interface Props {
  gc: GCData
}

export function EditGCDialog({ gc }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(gc.name)
  const [tribe, setTribe] = useState(gc.tribe)
  const [avatar, setAvatar] = useState(gc.avatar ?? "")
  const [basketGoal, setBasketGoal] = useState(String(gc.basketGoal ?? gc.goals?.[0]?.basketGoal ?? 0))
  const [clothesGoal, setClothesGoal] = useState(String(gc.clothesGoal ?? gc.goals?.[0]?.clothesGoal ?? 0))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("tribo", tribe)
      if (avatar) formData.append("avatar", avatar)

      await fetch(`/api/gc?id=${gc.id}`, { method: "PUT", body: formData })
      setOpen(false)
      window.location.reload()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Pencil className="size-3" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar GC</DialogTitle>
          <DialogDescription>Altere os dados do GC</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tribe">Tribo</Label>
            <Select value={tribe} onValueChange={(v) => setTribe(v ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRIBE_CONFIG).map(([key, t]) => (
                  <SelectItem key={key} value={key}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="avatar">URL do Avatar</Label>
            <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="basketGoal">Meta de Cestas</Label>
              <Input id="basketGoal" type="number" value={basketGoal} onChange={(e) => setBasketGoal(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clothesGoal">Meta de Roupas</Label>
              <Input id="clothesGoal" type="number" value={clothesGoal} onChange={(e) => setClothesGoal(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
