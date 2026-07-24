/**
 * API client para o recurso de usuários.
 */

import type { RegisterUserInput, UpdateUserInput, UserOutput } from "@/lib/api/types/users.types"

export async function fetchUsers(): Promise<UserOutput[]> {
  const res = await fetch("/api/users")
  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao carregar usuários")
  }

  return json.data.users
}

export async function registerUser(input: RegisterUserInput): Promise<UserOutput> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao cadastrar usuário")
  }

  return json.data.user
}

export async function updateUser({
  id,
  ...data
}: UpdateUserInput & { id: string }): Promise<UserOutput> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao atualizar usuário")
  }

  return json.data.user
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error ?? "Erro ao excluir usuário")
  }
}
