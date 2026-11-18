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

function getRequest() {
  return new NextRequest(new URL("http://localhost/api/goals?aggregate=true"))
}

function postRequest() {
  return new NextRequest(new URL("http://localhost/api/goals"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ basketGoal: 3500, clothesGoal: 1 }),
  })
}

describe("/api/goals authorization", () => {
  beforeEach(() => jest.resetAllMocks())

  it("returns 401 for GET without a session", async () => {
    mockedGetSessionUser.mockResolvedValue(null)

    const response = await GET(getRequest())

    expect(response.status).toBe(401)
  })

  it("blocks a normal user from creating goals", async () => {
    mockedGetSessionUser.mockResolvedValue(user("user-1", "user"))

    const response = await POST(postRequest())

    expect(response.status).toBe(403)
  })
})
