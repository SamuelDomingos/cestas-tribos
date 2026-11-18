/** @jest-environment node */

import { NextRequest } from "next/server"

import { getSessionUser } from "@/lib/auth"

import { GET, POST } from "./route"

jest.mock("@/lib/auth", () => ({
  getSessionUser: jest.fn(),
  getUserRole: (user: { user_metadata?: { role?: string } } | null) =>
    user?.user_metadata?.role === "admin" ? "admin" : "user",
}))

const mockedGetSessionUser = getSessionUser as jest.MockedFunction<
  typeof getSessionUser
>

function user(id: string, role: "admin" | "user") {
  return {
    id,
    email: `${id}@example.com`,
    user_metadata: { role, tribe: "hope" },
  } as never
}

function postRequest() {
  return new NextRequest(new URL("http://localhost/api/users"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "new@example.com",
      password: "secret123",
      name: "Novo",
      tribe: "hope",
      role: "user",
    }),
  })
}

describe("/api/users authorization", () => {
  beforeEach(() => jest.resetAllMocks())

  it("returns 401 for GET without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(401)
  })

  it("blocks a normal user from listing users", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await GET()

    expect(response.status).toBe(403)
  })

  it("blocks a normal user from creating users", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await POST(postRequest())

    expect(response.status).toBe(403)
  })
})
