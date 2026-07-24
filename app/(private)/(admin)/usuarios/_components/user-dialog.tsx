"use client"

import * as React from "react"
import { Controller } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUserForm } from "../_hooks/use-user-form"
import type { UserOutput } from "@/lib/api/types/users.types"

export function UserDialog({
  mode,
  user,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit"
  user?: UserOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = mode === "edit"
  const { form, tribes, isPending, onSubmit } = useUserForm({
    mode,
    user,
    open,
    onOpenChange,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Altere os dados do usuário selecionado."
              : "Cadastre um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                    placeholder="Nome completo"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    autoComplete="off"
                    disabled={isEdit}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Senha */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">
                    {isEdit ? "Nova senha (opcional)" : "Senha"}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder={
                      isEdit
                        ? "Deixe em branco para manter"
                        : "Mínimo 6 caracteres"
                    }
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Cargo */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role">Cargo</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="tribe" className="w-full">
                      <SelectValue placeholder="Selecione a tribo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tribes.map((tribe) => (
                        <SelectItem key={tribe.id} value={tribe.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage src={tribe.imageUrl} alt={tribe.name} />
                              <AvatarFallback className="text-[10px]">
                                {tribe.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{tribe.name}</span>
                          </div>
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
        </form>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form="user-form" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : isEdit
                ? "Salvar Alterações"
                : "Cadastrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
