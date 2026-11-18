import {
  deliveryCreateSchema,
  deliveryUpdateSchema,
  isAllowedPhotoUrl,
} from "./schema"

const GC_ID = "11111111-1111-4111-8111-111111111111"
const SUPABASE_URL = "https://example.supabase.co"
const PHOTO_URL = `${SUPABASE_URL}/storage/v1/object/public/deliveries/photo.jpg`

function validDelivery() {
  return {
    type: "BASKET" as const,
    quantity: 3500,
    gcId: GC_ID,
    photoUrl: PHOTO_URL,
    notes: "Entrega da semana",
  }
}

describe("delivery schemas", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
  })

  it("accepts a valid delivery", () => {
    expect(deliveryCreateSchema.safeParse(validDelivery()).success).toBe(true)
  })

  it("requires a photo", () => {
    const { photoUrl, ...withoutPhoto } = validDelivery()

    expect(photoUrl).toBeDefined()
    expect(deliveryCreateSchema.safeParse(withoutPhoto).success).toBe(false)
  })

  it.each([0, -1, 1.5])("rejects invalid quantity %s", (quantity) => {
    const result = deliveryCreateSchema.safeParse({
      ...validDelivery(),
      quantity,
    })

    expect(result.success).toBe(false)
  })

  it("rejects an invalid type", () => {
    const result = deliveryCreateSchema.safeParse({
      ...validDelivery(),
      type: "FOOD",
    })

    expect(result.success).toBe(false)
  })

  it("rejects unknown fields such as memberId", () => {
    const result = deliveryCreateSchema.safeParse({
      ...validDelivery(),
      memberId: "other-user",
    })

    expect(result.success).toBe(false)
  })

  it("rejects a photo outside the deliveries bucket", () => {
    const result = deliveryCreateSchema.safeParse({
      ...validDelivery(),
      photoUrl: "https://evil.example/photo.jpg",
    })

    expect(result.success).toBe(false)
  })

  it("rejects notes longer than 500 characters", () => {
    const result = deliveryCreateSchema.safeParse({
      ...validDelivery(),
      notes: "x".repeat(501),
    })

    expect(result.success).toBe(false)
  })

  it("accepts a partial update", () => {
    expect(
      deliveryUpdateSchema.safeParse({ quantity: 4000 }).success,
    ).toBe(true)
  })

  it("rejects an empty update", () => {
    expect(deliveryUpdateSchema.safeParse({}).success).toBe(false)
  })

  it("rejects memberId in an update", () => {
    expect(
      deliveryUpdateSchema.safeParse({ memberId: "other-user" }).success,
    ).toBe(false)
  })
})

describe("isAllowedPhotoUrl", () => {
  it("accepts only the configured deliveries bucket", () => {
    expect(isAllowedPhotoUrl(PHOTO_URL, SUPABASE_URL)).toBe(true)
    expect(
      isAllowedPhotoUrl(
        `${SUPABASE_URL}/storage/v1/object/public/avatars/photo.jpg`,
        SUPABASE_URL,
      ),
    ).toBe(false)
    expect(
      isAllowedPhotoUrl("https://evil.example/photo.jpg", SUPABASE_URL),
    ).toBe(false)
  })
})
