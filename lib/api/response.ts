/**
 * Helpers para respostas padronizadas da API REST.
 */

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function apiError(error: string, status = 400) {
  return Response.json({ success: false, error }, { status })
}
