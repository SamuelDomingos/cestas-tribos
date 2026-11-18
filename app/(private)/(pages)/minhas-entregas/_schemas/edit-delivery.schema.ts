import { z } from "zod"

export const editDeliverySchema = z.object({
  type: z.enum(["BASKET", "CLOTHES"], { message: "Selecione o tipo" }),
  quantity: z
    .number()
    .int("A quantidade deve ser um número inteiro")
    .positive("Informe um valor maior que zero"),
  gcId: z.string().min(1, "Selecione um GC"),
  photo: z.instanceof(File).optional(),
  notes: z
    .string()
    .max(500, "A observação deve ter no máximo 500 caracteres")
    .optional(),
})

export type EditDeliveryFormData = z.infer<typeof editDeliverySchema>
