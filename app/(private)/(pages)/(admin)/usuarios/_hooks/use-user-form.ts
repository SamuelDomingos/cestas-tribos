"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { formSchema, type FormData } from "../_schemas/user.schema"
import { useRegisterUser, useUpdateUser } from "./use-users"
import type { UserOutput } from "@/lib/api/types/users.types"

interface UseUserFormProps {
  mode: "create" | "edit"
  user?: UserOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 3 tribos fixas
const TRIBES = [
  { id: "hope", name: "Hope", imageUrl: "/tribos/hope.jpeg" },
  { id: "hazak", name: "Hazak", imageUrl: "/tribos/hazak.jpeg" },
  { id: "sent", name: "Sent", imageUrl: "/tribos/sent.jpeg" },
]

export function useUserForm({
  mode,
  user,
  open,
  onOpenChange,
}: UseUserFormProps) {
  const isEdit = mode === "edit"

  const registerUser = useRegisterUser()
  const updateUser = useUpdateUser()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      tribe: "",
    },
  })

  React.useEffect(() => {
    if (open && isEdit && user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role as "admin" | "user",
        tribe: user.tribe,
      })
    } else if (open && !isEdit) {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "user",
        tribe: "",
      })
    }
  }, [open, isEdit, user, form])

  const isPending = registerUser.isPending || updateUser.isPending

  function onSubmit(data: FormData) {
    if (isEdit && user) {
      updateUser.mutate(
        {
          id: user.id,
          name: data.name,
          role: data.role,
          tribe: data.tribe,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      if (!data.password || data.password.length < 6) {
        toast.error("A senha deve ter ao menos 6 caracteres")
        return
      }

      registerUser.mutate(
        {
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          tribe: data.tribe,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return { form, tribes: TRIBES, isPending, onSubmit }
}
