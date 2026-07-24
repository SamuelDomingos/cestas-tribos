"use client"

import { Controller } from "react-hook-form"
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
import {
  Field, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field"
import { PlusCircle, ShoppingBag, Shirt, Loader2, Banknote } from "lucide-react"
import { useAddDelivery } from "./use-add-delivery"

export function AddDeliveryDialog() {
  const {
    open,
    setOpen,
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
  } = useAddDelivery()

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

        <form id="delivery-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <FieldGroup>
              {/* Tipo */}
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
                        onClick={() => field.onChange("BASKET")}
                      >
                        <ShoppingBag className="size-4" />
                        Cesta Básica
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "CLOTHES" ? "default" : "outline"}
                        className="gap-2"
                        onClick={() => field.onChange("CLOTHES")}
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

              {/* Quantidade / Valor */}
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => {
                  const deliveryType = form.watch("type")
                  const isBasket = deliveryType === "BASKET"

                  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!isBasket) {
                      field.onChange(Number(e.target.value))
                      return
                    }
                    // Remove tudo que não é dígito
                    const digits = e.target.value.replace(/\D/g, "")
                    field.onChange(digits ? Number(digits) : 0)
                  }

                  // Mostra o valor formatado: centavos → reais
                  const displayValue = isBasket && field.value > 0
                    ? (field.value / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                    : String(field.value || "")

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="quantity">
                        {isBasket ? "Valor" : "Quantidade"}
                      </FieldLabel>
                      <div className="relative">
                        {isBasket && (
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            R$
                          </span>
                        )}
                        <Input
                          id="quantity"
                          type="text"
                          inputMode={isBasket ? "numeric" : "numeric"}
                          value={displayValue}
                          onChange={handleChange}
                          placeholder={isBasket ? "0,00" : "1"}
                          className={isBasket ? "pl-9" : ""}
                          aria-invalid={fieldState.invalid}
                        />
                      </div>
                      {isBasket && field.value > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {field.value.toLocaleString("pt-BR")} centavos
                        </span>
                      )}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }}
              />

              {/* GC */}
              <Controller
                name="gcId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gc">{gcLabel}</FieldLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v ?? "")}
                    >
                      <SelectTrigger id="gc" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={gcs.length === 0 ? "Carregando..." : "Selecione o GC"}>
                          {selectedGC && (
                            <span className="flex items-center gap-2">
                              {selectedGC.avatar && (
                                <img
                                  src={selectedGC.avatar}
                                  alt=""
                                  className="size-5 rounded-full object-cover"
                                />
                              )}
                              <span className="flex-1 truncate">{selectedGC.name}</span>
                              {userRole === "admin" && (
                                <span className="text-muted-foreground">({selectedGC.tribe})</span>
                              )}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {filteredGCs.map((gc) => (
                          <SelectItem key={gc.id} value={gc.id}>
                            {gc.avatar && (
                              <img
                                src={gc.avatar}
                                alt=""
                                className="size-5 rounded-full object-cover"
                              />
                            )}
                            {gc.name}
                            {userRole === "admin" && ` (${gc.tribe})`}
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
            </FieldGroup>

            {/* Foto (fora do Controller — é File, não texto) */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="photo">Foto (opcional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
              {photoPreviewUrl && (
                <div className="mt-1 overflow-hidden rounded-md border">
                  <img
                    src={photoPreviewUrl}
                    alt="Preview da foto"
                    className="h-32 w-full object-cover"
                  />
                </div>
              )}
              {photoFile && (
                <span className="text-xs text-muted-foreground">{photoFile.name}</span>
              )}
            </div>

            {/* Observações */}
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="notes">Observações (opcional)</FieldLabel>
                  <Input
                    id="notes"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Alguma observação"
                  />
                </Field>
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="delivery-form" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Salvando..." : "Registrar Entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
