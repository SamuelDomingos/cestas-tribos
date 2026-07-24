import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Preço de cada cesta básica em reais (referência). */
export const BASKET_PRICE = 35

/**
 * Formata um valor de cesta em reais.
 * O valor armazenado está em centavos (ex: 3500 = R$ 35,00).
 */
export function formatBasketValue(value: number): string {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export const TRIBE_ORDER = ["hope", "hazak", "sent"]

export const TRIBE_CONFIG: Record<string, { name: string; image: string }> = {
  hope: { name: "hope", image: "/tribos/hope.jpeg" },
  hazak: { name: "hazak", image: "/tribos/hazak.jpeg" },
  sent: { name: "sent", image: "/tribos/sent.jpeg" },
}
