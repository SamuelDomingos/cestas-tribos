import { z } from "zod"

export function isAllowedPhotoUrl(
  value: string,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
) {
  const baseUrl = supabaseUrl?.replace(/\/$/, "")

  if (!baseUrl) {
    return /^https?:\/\//.test(value)
  }

  return value.startsWith(
    `${baseUrl}/storage/v1/object/public/deliveries/`,
  )
}

const photoUrlSchema = z
  .string()
  .url("URL do comprovante inválida")
  .refine((value) => isAllowedPhotoUrl(value), {
    message: "O comprovante deve estar no bucket deliveries",
  })

const deliveryFields = {
  type: z.enum(["BASKET", "CLOTHES"], { message: "Tipo de entrega inválido" }),
  quantity: z
    .number()
    .int("A quantidade deve ser um número inteiro")
    .positive("A quantidade deve ser maior que zero"),
  gcId: z.string().uuid("GC inválido"),
  notes: z
    .string()
    .max(500, "A observação deve ter no máximo 500 caracteres")
    .nullable()
    .optional(),
}

export const deliveryCreateSchema = z
  .object({
    ...deliveryFields,
    photoUrl: photoUrlSchema,
  })
  .strict()

export const deliveryUpdateSchema = z
  .object({
    type: deliveryFields.type.optional(),
    quantity: deliveryFields.quantity.optional(),
    gcId: deliveryFields.gcId.optional(),
    photoUrl: photoUrlSchema.optional(),
    notes: deliveryFields.notes,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  })
