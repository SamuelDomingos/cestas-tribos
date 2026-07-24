import { z } from "zod"

export const editGcSchema = z.object({
  name: z.string().min(2, "O nome deve ter ao menos 2 caracteres"),
  tribe: z.string().min(1, "Selecione uma tribo"),
  avatar: z.string().optional(),
  basketGoal: z.number().min(0, "A meta deve ser um número positivo"),
  clothesGoal: z.number().min(0, "A meta deve ser um número positivo"),
})

export type EditGCFormData = z.infer<typeof editGcSchema>
