import {
  actorFromUser,
  canDeleteDelivery,
  canEditDelivery,
  canReadTribe,
  canUseGC,
  isAdmin,
} from "./authorization"

describe("delivery authorization", () => {
  const user = actorFromUser({
    id: "user-1",
    user_metadata: { role: "user", tribe: "hope" },
  })
  const admin = actorFromUser({
    id: "admin-1",
    user_metadata: { role: "admin", tribe: "hope" },
  })

  it("normalizes an unknown role to user", () => {
    const actor = actorFromUser({
      id: "user-2",
      user_metadata: { role: "owner", tribe: "sent" },
    })

    expect(actor.role).toBe("user")
    expect(actor.tribe).toBe("sent")
  })

  it("only lets the owner edit a delivery", () => {
    expect(canEditDelivery(user, { memberId: "user-1" })).toBe(true)
    expect(canEditDelivery(user, { memberId: "user-2" })).toBe(false)
    expect(canEditDelivery(admin, { memberId: "user-2" })).toBe(false)
  })

  it("only lets admins delete deliveries", () => {
    expect(canDeleteDelivery(admin)).toBe(true)
    expect(canDeleteDelivery(user)).toBe(false)
  })

  it("restricts GC use to the actor tribe unless admin", () => {
    expect(canUseGC(user, "hope")).toBe(true)
    expect(canUseGC(user, "sent")).toBe(false)
    expect(canUseGC(admin, "sent")).toBe(true)
  })

  it("rejects users without a tribe from cross-tribe access", () => {
    const actor = actorFromUser({ id: "user-3", user_metadata: {} })

    expect(isAdmin(actor)).toBe(false)
    expect(canUseGC(actor, "hope")).toBe(false)
    expect(canReadTribe(actor, "hope")).toBe(false)
  })
})
