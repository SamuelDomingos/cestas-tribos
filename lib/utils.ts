import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TRIBE_ORDER = ["hope", "hazak", "sent"]

export const TRIBE_CONFIG: Record<string, { name: string; image: string }> = {
  hope: { name: "hope", image: "/tribos/hope.jpeg" },
  hazak: { name: "hazak", image: "/tribos/hazak.jpeg" },
  sent: { name: "sent", image: "/tribos/sent.jpeg" },
}
