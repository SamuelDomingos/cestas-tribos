"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { useMetas, calcStats, sumStats, TRIBE_ORDER } from "./_data/hooks"
import { MetasOverview } from "./_components/metas-overview"
import { TribeSection } from "./_components/tribe-section"

export default function MetasPage() {
  const [userRole, setUserRole] = useState<string>("user")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      const meta = res.data?.user?.user_metadata || {}
      setUserRole((meta.role as string) || "user")
    })
  }, [])

  const isAdmin = userRole === "admin"
  const { data: gcs = [], isLoading } = useMetas()

  // Agrupar por tribo na ordem fixa
  const tribesMap = new Map<string, typeof gcs>()
  for (const gc of gcs) {
    const t = gc.tribe || "sem"
    if (!tribesMap.has(t)) tribesMap.set(t, [])
    tribesMap.get(t)!.push(gc)
  }
  const tribes = TRIBE_ORDER.filter((t) => tribesMap.has(t)).map((t) => ({ name: t, gcs: tribesMap.get(t)! }))

  // Totais gerais
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
