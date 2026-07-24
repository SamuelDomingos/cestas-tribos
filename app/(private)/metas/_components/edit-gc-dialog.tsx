"use client"

import { useState } from "react"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import type { GCOutput } from "@/lib/api/types/gcs.types"
import { TRIBE_CONFIG } from "@/lib/utils"
import { useEditGCForm } from "../_hooks/use-edit-gc-form"

export function EditGCDialog({ gc }: { gc: GCOutput }) {
  const [open, setOpen] = useState(false)
  const { form, isPending, onSubmit } = useEditGCForm({ gc, open, onOpenChange: setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Pencil className="size-3" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar GC</DialogTitle>
          <DialogDescription>Altere os dados do GC</DialogDescription>
        </DialogHeader>

        <form id="edit-gc-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Nome */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Nome do GC"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Tribo */}
            <Controller
              name="tribe"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tribe">Tribo</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tribe" className="w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione a tribo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRIBE_CONFIG).map(([key, t]) => (
                        <SelectItem key={key} value={key}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Avatar */}
            <Controller
              name="avatar"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="avatar">URL do Avatar</FieldLabel>
                  <Input
                    {...field}
                    id="avatar"
                    placeholder="https://..."
                    autoComplete="off"
                  />
                </Field>
              )}
            />

            {/* Metas */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="basketGoal"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="basketGoal">Meta de Cestas</FieldLabel>
                    <Input
                      id="basketGoal"
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="clothesGoal"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="clothesGoal">Meta de Roupas</FieldLabel>
                    <Input
                      id="clothesGoal"
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-gc-form" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
