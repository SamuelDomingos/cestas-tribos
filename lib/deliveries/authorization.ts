export type DeliveryRole = "admin" | "user"

export interface DeliveryActor {
  id: string
  role: DeliveryRole
  tribe: string | null
}

export interface DeliveryOwnership {
  memberId: string
}

export function actorFromUser(user: {
  id: string
  user_metadata?: Record<string, unknown>
}): DeliveryActor {
  const role: DeliveryRole =
    user.user_metadata?.role === "admin" ? "admin" : "user"
  const tribe = user.user_metadata?.tribe

  return {
    id: user.id,
    role,
    tribe: typeof tribe === "string" && tribe.length > 0 ? tribe : null,
  }
}

export function isAdmin(actor: DeliveryActor): boolean {
  return actor.role === "admin"
}

export function canEditDelivery(
  actor: DeliveryActor,
  delivery: DeliveryOwnership,
): boolean {
  return delivery.memberId === actor.id
}

export function canDeleteDelivery(actor: DeliveryActor): boolean {
  return isAdmin(actor)
}

export function canUseGC(actor: DeliveryActor, gcTribe: string): boolean {
  return isAdmin(actor) || (actor.tribe !== null && actor.tribe === gcTribe)
}

export function canReadTribe(actor: DeliveryActor, tribe: string): boolean {
  return isAdmin(actor) || (actor.tribe !== null && actor.tribe === tribe)
}
