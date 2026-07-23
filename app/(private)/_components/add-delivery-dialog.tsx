"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

export function AddDeliveryDialog() {
  const [open, setOpen] = useState(false)

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
            Registre uma entrega de cesta ou roupa com foto de comprovação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basket">Cesta Básica</SelectItem>
                <SelectItem value="clothes">Roupas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input id="quantity" type="number" min={1} placeholder="Ex: 1" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="photo">Foto de Comprovação</Label>
            <Input id="photo" type="file" accept="image/*" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input id="notes" placeholder="Alguma observação sobre a entrega" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit">
            Registrar Entrega
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
