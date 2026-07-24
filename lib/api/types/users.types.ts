/**
 * Tipos de entrada/saída para o recurso de usuários.
 * Dados armazenados no user_metadata do Supabase Auth.
 */

export interface RegisterUserInput {
  email: string
  password: string
  name: string
  role: "admin" | "user"
  tribe: string
}

export interface UpdateUserInput {
  name?: string
  role?: "admin" | "user"
  tribe?: string
}

export interface UserOutput {
  id: string
  email: string
  name: string
  role: string
  tribe: string
  tribeName: string
  createdAt: string
}
