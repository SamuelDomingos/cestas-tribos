import { z } from "zod"

export const deliverySchema = z.object({
  type: z.enum(["BASKET", "CLOTHES"], { message: "Selecione o tipo" }),
  quantity: z.number().min(1, "Mínimo de R$ 0,01"),
  gcId: z.string().min(1, "Selecione um GC"),
  notes: z.string().optional(),
})

export type DeliveryFormData = z.infer<typeof deliverySchema>
