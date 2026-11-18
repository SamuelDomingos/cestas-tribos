/** @jest-environment node */

import { NextRequest } from "next/server"

import { getSessionUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/server"
import { createSupabaseMock } from "@/test-utils/supabase-mock"

import { DELETE, PATCH } from "./route"

jest.mock("@/lib/auth", () => ({ getSessionUser: jest.fn() }))
jest.mock("@/lib/supabase/server", () => ({ createServiceClient: jest.fn() }))
// Em runtime real o cache roda no Next; no jest o revalidateTag exige o
// incrementalCache do servidor, então devolvemos o comportamento passthrough.
jest.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
  revalidateTag: jest.fn(),
}))

const mockedGetSessionUser = getSessionUser as jest.MockedFunction<
  typeof getSessionUser
>
const mockedCreateServiceClient = createServiceClient as jest.MockedFunction<
  typeof createServiceClient
>

const DELIVERY_ID = "11111111-1111-4111-8111-111111111111"
const GC_ID = "22222222-2222-4222-8222-222222222222"
const SENT_GC_ID = "33333333-3333-4333-8333-333333333333"

function user(id: string, role: "admin" | "user", tribe = "hope") {
  return {
    id,
    email: `${id}@example.com`,
    user_metadata: { role, tribe },
  } as never
}

function context(id = DELIVERY_ID) {
  return { params: Promise.resolve({ id }) }
}

function patchRequest(body: unknown) {
  return new NextRequest(
    new URL(`http://localhost/api/deliveries/${DELIVERY_ID}`),
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  )
}

function deleteRequest() {
  return new NextRequest(
    new URL(`http://localhost/api/deliveries/${DELIVERY_ID}`),
    { method: "DELETE" },
  )
}

function currentDelivery(memberId = "user-1") {
  return {
    data: {
      id: DELIVERY_ID,
      memberId,
      gcId: GC_ID,
      type: "BASKET",
      quantity: 3500,
    },
    error: null,
  }
}

describe("PATCH /api/deliveries/[id]", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("returns 401 without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await PATCH(patchRequest({ quantity: 4000 }), context())

    expect(response.status).toBe(401)
  })

  it("rejects an empty update", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await PATCH(patchRequest({}), context())

    expect(response.status).toBe(400)
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("blocks editing someone else's delivery", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))
    const mock = createSupabaseMock({
      deliveries: [currentDelivery("user-2")],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await PATCH(patchRequest({ quantity: 4000 }), context())

    expect(response.status).toBe(403)
    expect(mock.calls.update).toHaveLength(0)
  })

  it("does not let an admin edit someone else's delivery", async () => {
    mockedGetSessionUser.mockResolvedValue(user("admin-1", "admin"))
    const mock = createSupabaseMock({
      deliveries: [currentDelivery("user-2")],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await PATCH(patchRequest({ quantity: 4000 }), context())

    expect(response.status).toBe(403)
  })

  it("lets the owner update quantity and notes", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))
    const mock = createSupabaseMock({
      deliveries: [
        currentDelivery("user-1"),
        { data: { id: DELIVERY_ID }, error: null },
      ],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await PATCH(
      patchRequest({ quantity: 4000, notes: "Corrigido" }),
      context(),
    )

    expect(response.status).toBe(200)
    expect(mock.calls.update[0]).toEqual({
      quantity: 4000,
      notes: "Corrigido",
    })
  })

  it("requires a quantity when changing the type", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))
    const mock = createSupabaseMock({
      deliveries: [currentDelivery("user-1")],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await PATCH(patchRequest({ type: "CLOTHES" }), context())

    expect(response.status).toBe(400)
    expect(mock.calls.update).toHaveLength(0)
  })

  it("blocks moving a delivery to another tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))
    const mock = createSupabaseMock({
      deliveries: [currentDelivery("user-1")],
      gcs: [{ data: { id: SENT_GC_ID, tribe: "sent" }, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await PATCH(
      patchRequest({ gcId: SENT_GC_ID }),
      context(),
    )

    expect(response.status).toBe(403)
    expect(mock.calls.update).toHaveLength(0)
  })

  it("rejects an invalid delivery id", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await PATCH(
      patchRequest({ quantity: 4000 }),
      context("not-a-uuid"),
    )

    expect(response.status).toBe(400)
  })
})

describe("DELETE /api/deliveries/[id]", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("returns 401 without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await DELETE(deleteRequest(), context())

    expect(response.status).toBe(401)
  })

  it("blocks a normal user before touching the database", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await DELETE(deleteRequest(), context())

    expect(response.status).toBe(403)
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("lets an admin delete a delivery", async () => {
    mockedGetSessionUser.mockResolvedValue(user("admin-1", "admin"))
    const mock = createSupabaseMock({
      deliveries: [{ data: { id: DELIVERY_ID }, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await DELETE(deleteRequest(), context())

    expect(response.status).toBe(200)
    expect(mock.calls.delete).toHaveLength(1)
  })

  it("returns 404 when the delivery does not exist", async () => {
    mockedGetSessionUser.mockResolvedValue(user("admin-1", "admin"))
    const mock = createSupabaseMock({
      deliveries: [{ data: null, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await DELETE(deleteRequest(), context())

    expect(response.status).toBe(404)
  })
})
