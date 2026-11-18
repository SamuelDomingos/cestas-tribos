"use client"

import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { MetasOverview } from "./_components/metas-overview"
import { TribeSection } from "./_components/tribe-section"
import { useMetas } from "./_hooks/use-gcs"
import { calcStats, sumStats } from "./_data/utils"
import { useSessionUser } from "@/hooks/use-session-user"
import { TRIBE_ORDER } from "@/lib/utils"

export default function MetasPage() {
  const session = useSessionUser()
  const isAdmin = session.data?.role === "admin"
  const { data: gcs = [], isLoading } = useMetas()

  const tribesMap = new Map<string, typeof gcs>()
  for (const gc of gcs) {
    const t = gc.tribe || "sem"
    if (!tribesMap.has(t)) tribesMap.set(t, [])
    tribesMap.get(t)!.push(gc)
  }
  const tribes = TRIBE_ORDER.filter((t) => tribesMap.has(t)).map((t) => ({ name: t, gcs: tribesMap.get(t)! }))

  const totals = sumStats(gcs.map(calcStats))

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe o progresso das tribos</p>
        </div>
        {isAdmin && (
          <Button size="sm">
            <Plus className="size-4" />
            Novo GC
          </Button>
        )}
      </div>

      <MetasOverview totals={totals} />

      {tribes.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground">
          <Target className="size-10" />
          <p>Nenhum GC cadastrado ainda.</p>
        </div>
      )}

      {tribes.map((tribe) => (
        <TribeSection key={tribe.name} tribeName={tribe.name} gcs={tribe.gcs} isAdmin={isAdmin} />
      ))}
    </div>
  )
}
