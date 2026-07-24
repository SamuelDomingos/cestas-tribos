"use client"

import Image from "next/image"
import { Heart } from "lucide-react"

export function CampaignHeader() {
  return (
    <header className="flex flex-col items-center gap-4 px-4 py-8">
      {/* Logo */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
        <div className="relative flex size-24 items-center justify-center border-4 border-primary/10 bg-card shadow-lg sm:size-28">
          <Image
            src="/logo-asv.png"
            alt="Ame Seu Vizinho"
            width={96}
            height={96}
            className="size-20 object-contain sm:size-24"
            priority
          />
        </div>
      </div>

      {/* Textos */}
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <Heart className="size-4 fill-primary text-primary" />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Painel da Campanha</h1>
          <Heart className="size-4 fill-primary text-primary" />
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Acompanhe em tempo real o progresso das entregas
        </p>
      </div>

      {/* Indicador tempo real */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] text-muted-foreground">Atualizado em tempo real</span>
      </div>
    </header>
  )
}
