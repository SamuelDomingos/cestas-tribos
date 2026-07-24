import { z } from "zod"

export const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().optional(),
  role: z.enum(["admin", "user"] as const),
  tribe: z.string().min(1, "Selecione uma tribo"),
})

export type FormData = z.infer<typeof formSchema>
