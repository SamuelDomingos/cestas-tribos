/**
 * Tipos de entrada/saída para o recurso de tribos.
 */

export interface CreateTribeInput {
  name: string
  description?: string
  imageUrl?: string
}

export interface UpdateTribeInput {
  name?: string
  description?: string
  imageUrl?: string
}

export interface TribeOutput {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  memberCount: number
}
