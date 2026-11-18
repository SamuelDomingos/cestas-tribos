/** @jest-environment node */

import { NextRequest } from "next/server"

import { getSessionUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/server"
import { createSupabaseMock } from "@/test-utils/supabase-mock"

import { GET, POST } from "./route"

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

const SUPABASE_URL = "https://example.supabase.co"
const GC_ID = "11111111-1111-4111-8111-111111111111"
const PHOTO_URL = `${SUPABASE_URL}/storage/v1/object/public/deliveries/photo.jpg`

function user(id: string, role: "admin" | "user", tribe = "hope") {
  return {
    id,
    email: `${id}@example.com`,
    user_metadata: { role, tribe },
  } as never
}

function getRequest(url: string) {
  return new NextRequest(new URL(url))
}

function postRequest(body: unknown) {
  return new NextRequest(new URL("http://localhost/api/deliveries"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

function validBody() {
  return {
    type: "BASKET",
    quantity: 3500,
    gcId: GC_ID,
    photoUrl: PHOTO_URL,
    notes: "Entrega",
  }
}

describe("GET /api/deliveries", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
  })

  it("returns 401 without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await GET(getRequest("http://localhost/api/deliveries"))

    expect(response.status).toBe(401)
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("blocks a normal user from listing all deliveries", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await GET(
      getRequest("http://localhost/api/deliveries?all=true"),
    )

    expect(response.status).toBe(403)
  })

  it("blocks a normal user from another tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))

    const response = await GET(
      getRequest("http://localhost/api/deliveries?tribe=sent"),
    )

    expect(response.status).toBe(403)
  })

  it("scopes mine=true to the session member", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))
    const mock = createSupabaseMock({ deliveries: [{ data: [], error: null }] })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await GET(
      getRequest("http://localhost/api/deliveries?mine=true&limit=200"),
    )

    expect(response.status).toBe(200)
    expect(mock.calls.eq).toContainEqual(["memberId", "user-1"])
    expect(mock.calls.limit).toContainEqual([200])
  })

  it("forces a normal user's read to their tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))
    const mock = createSupabaseMock({
      gcs: [{ data: [{ id: GC_ID }], error: null }],
      deliveries: [{ data: [], error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await GET(getRequest("http://localhost/api/deliveries"))

    expect(response.status).toBe(200)
    expect(mock.calls.in).toContainEqual(["gcId", [GC_ID]])
  })
})

describe("POST /api/deliveries", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL
  })

  it("returns 401 without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await POST(postRequest(validBody()))

    expect(response.status).toBe(401)
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("rejects an invalid payload before touching the database", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await POST(postRequest({ ...validBody(), quantity: 0 }))

    expect(response.status).toBe(400)
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("rejects a memberId sent by the client", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await POST(
      postRequest({ ...validBody(), memberId: "other-user" }),
    )

    expect(response.status).toBe(400)
  })

  it("blocks a delivery in another tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))
    const mock = createSupabaseMock({
      gcs: [{ data: { id: GC_ID, tribe: "sent" }, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await POST(postRequest(validBody()))

    expect(response.status).toBe(403)
    expect(mock.calls.insert).toHaveLength(0)
  })

  it("uses the session member and ignores client ownership", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))
    const mock = createSupabaseMock({
      gcs: [{ data: { id: GC_ID, tribe: "hope" }, error: null }],
      deliveries: [{ data: { id: "delivery-1" }, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await POST(postRequest(validBody()))

    expect(response.status).toBe(201)
    expect(mock.calls.insert[0]).toMatchObject({
      memberId: "user-1",
      gcId: GC_ID,
      type: "BASKET",
      quantity: 3500,
      photoUrl: PHOTO_URL,
    })
  })

  it("lets an admin register in any tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("admin-1", "admin", "hope"))
    const mock = createSupabaseMock({
      gcs: [{ data: { id: GC_ID, tribe: "sent" }, error: null }],
      deliveries: [{ data: { id: "delivery-1" }, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await POST(postRequest(validBody()))

    expect(response.status).toBe(201)
  })
})
