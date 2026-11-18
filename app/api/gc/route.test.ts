/** @jest-environment node */

import { NextRequest } from "next/server"

import { getSessionUser } from "@/lib/auth"
import { createServiceClient } from "@/lib/supabase/server"
import { createSupabaseMock } from "@/test-utils/supabase-mock"

import { DELETE, GET } from "./route"

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

function user(id: string, role: "admin" | "user", tribe = "hope") {
  return {
    id,
    email: `${id}@example.com`,
    user_metadata: { role, tribe },
  } as never
}

function getRequest(url = "http://localhost/api/gc") {
  return new NextRequest(new URL(url))
}

function deleteRequest() {
  return new NextRequest(new URL("http://localhost/api/gc?id=gc-1"), {
    method: "DELETE",
  })
}

describe("GET /api/gc", () => {
  beforeEach(() => jest.resetAllMocks())

  it("returns 401 without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await GET(getRequest())

    expect(response.status).toBe(401)
  })

  it("returns an empty list for a user without a tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", ""))

    const response = await GET(getRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual([])
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("scopes a normal user to their tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))
    const mock = createSupabaseMock({
      gcs: [{ data: [], error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await GET(getRequest())

    expect(response.status).toBe(200)
    expect(mock.calls.eq).toContainEqual(["tribe", "hope"])
  })

  it("blocks a normal user from another tribe", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user", "hope"))

    const response = await GET(getRequest("http://localhost/api/gc?tribo=sent"))

    expect(response.status).toBe(403)
  })
})

describe("DELETE /api/gc", () => {
  beforeEach(() => jest.resetAllMocks())

  it("blocks a normal user before touching the database", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await DELETE(deleteRequest())

    expect(response.status).toBe(403)
    expect(mockedCreateServiceClient).not.toHaveBeenCalled()
  })

  it("lets an admin delete a GC", async () => {
    mockedGetSessionUser.mockResolvedValue(user("admin-1", "admin"))
    const mock = createSupabaseMock({
      gcs: [{ data: null, error: null }],
    })
    mockedCreateServiceClient.mockReturnValue(mock.client as never)

    const response = await DELETE(deleteRequest())

    expect(response.status).toBe(200)
    expect(mock.calls.delete).toHaveLength(1)
  })
})
