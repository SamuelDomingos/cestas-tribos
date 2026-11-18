"use client"

import { useState } from "react"
import { Controller } from "react-hook-form"
import { ImagePlus, Loader2, Pencil, Shirt, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DeliveryOutput } from "@/lib/api"

import { useEditDelivery } from "../_hooks/use-edit-delivery"

export function EditDeliveryDialog({
  delivery,
  userTribe,
  isAdmin,
}: {
  delivery: DeliveryOutput
  userTribe: string
  isAdmin: boolean
}) {
  const [open, setOpen] = useState(false)
  const {
    form,
    availableGCs,
    photoPreview,
    isPending,
    onSubmit,
  } = useEditDelivery({
    delivery,
    userTribe,
    isAdmin,
    open,
    onOpenChange: setOpen,
  })

  const deliveryType = form.watch("type")
  const isBasket = deliveryType === "BASKET"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar entrega"
          />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar entrega</DialogTitle>
          <DialogDescription>
            Corrija o tipo, o valor, o GC, a foto ou a observação.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-delivery-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <FieldGroup>
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Tipo</FieldLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={field.value === "BASKET" ? "default" : "outline"}
                        className="gap-2"
                        onClick={() => {
                          if (field.value === "BASKET") return
                          field.onChange("BASKET")
                          form.setValue("quantity", 3500, {
                            shouldValidate: true,
                          })
                        }}
                      >
                        <ShoppingBag className="size-4" />
                        Cesta Básica
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value === "CLOTHES" ? "default" : "outline"
                        }
                        className="gap-2"
                        onClick={() => {
                          if (field.value === "CLOTHES") return
                          field.onChange("CLOTHES")
                          form.setValue("quantity", 1, {
                            shouldValidate: true,
                          })
                        }}
                      >
                        <Shirt className="size-4" />
                        Roupas
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => {
                  const displayValue =
                    isBasket && field.value > 0
                      ? (field.value / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })
                      : String(field.value ?? "")

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-quantity">
                        {isBasket ? "Valor" : "Quantidade"}
                      </FieldLabel>
                      <div className="relative">
                        {isBasket && (
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            R$
                          </span>
                        )}
                        <Input
                          id="edit-quantity"
                          type="text"
                          inputMode="numeric"
                          value={displayValue}
                          onChange={(event) => {
                            if (!isBasket) {
                              field.onChange(Number(event.target.value))
                              return
                            }

                            const digits = event.target.value.replace(
                              /\D/g,
                              "",
                            )
                            field.onChange(digits ? Number(digits) : 0)
                          }}
                          placeholder={isBasket ? "0,00" : "1"}
                          className={isBasket ? "pl-9" : ""}
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />

              <Controller
                name="gcId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-gc">GC</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="edit-gc"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecione o GC" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGCs.map((gc) => (
                          <SelectItem key={gc.id} value={gc.id}>
                            <span className="flex items-center gap-2">
                              {gc.avatar && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={gc.avatar}
                                  alt=""
                                  className="size-5 rounded-full object-cover"
                                />
                              )}
                              <span>{gc.name}</span>
                              {isAdmin && (
                                <span className="text-muted-foreground">
                                  ({gc.tribe})
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="photo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-photo">
                      Foto do comprovante
                    </FieldLabel>
                    <Input
                      id="edit-photo"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        field.onChange(event.target.files?.[0] ?? undefined)
                      }
                    />
                    <div className="overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview ?? delivery.photoUrl ?? ""}
                        alt="Comprovante atual"
                        className="h-32 w-full object-cover"
                      />
                    </div>
                    {!photoPreview && !delivery.photoUrl && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <ImagePlus className="size-3.5" />
                        Envie uma foto para salvar.
                      </span>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-notes">
                      Observações (opcional)
                    </FieldLabel>
                    <Input
                      id="edit-notes"
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Alguma observação"
                      maxLength={500}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-delivery-form" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
