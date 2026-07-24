"use client"

import { useCallback, useState } from "react"
import { useReport } from "./_hooks/use-report"
import {
  ShoppingBag, Shirt, Download, Loader2, FileImage, Calendar,
  Filter, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { TRIBE_CONFIG } from "@/lib/utils"
import type { DeliveryOutput } from "@/lib/api/types/gcs.types"
import JSZip from "jszip"
import { saveAs } from "file-saver"

/** Baixa uma imagem da URL e retorna como ArrayBuffer */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  return res.blob()
}

function DeliveryPhotoCard({
  delivery,
  gcName,
  tribeName,
}: {
  delivery: DeliveryOutput
  gcName: string
  tribeName: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border bg-card">
      <div className="flex items-center gap-3 p-3">
        {/* Mini foto preview */}
        {delivery.photoUrl && (
          <button onClick={() => setExpanded(!expanded)} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={delivery.photoUrl}
              alt="Comprovante"
              className="size-14 border object-cover"
            />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {delivery.type === "BASKET" ? (
              <ShoppingBag className="size-3.5 text-primary" />
            ) : (
              <Shirt className="size-3.5 text-emerald-600" />
            )}
            {delivery.type === "BASKET" ? "Cesta" : "Roupa"} x{delivery.quantity}
          </div>
          <div className="text-xs text-muted-foreground">
            {gcName} — {tribeName}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(delivery.deliveredAt).toLocaleDateString("pt-BR")}
          </div>
        </div>

        <a
          href={delivery.photoUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
          download
        >
          <Button variant="outline" size="icon" title="Baixar">
            <Download className="size-4" />
          </Button>
        </a>
      </div>

      {/* Foto expandida */}
      {expanded && delivery.photoUrl && (
        <div className="border-t p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={delivery.photoUrl}
            alt="Comprovante"
            className="w-full border object-contain"
          />
        </div>
      )}
    </div>
  )
}

export default function RelatoriosPage() {
  const {
    startDate, setStartDate, endDate, setEndDate,
    tribeFilter, setTribeFilter, tribes, gcMap,
    deliveries, photoDeliveries, summary, isLoading,
  } = useReport()

  const [downloading, setDownloading] = useState(false)

  const handleDownloadAll = useCallback(async () => {
    if (photoDeliveries.length === 0) return
    setDownloading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder("comprovantes")
      if (!folder) return

      let completed = 0
      const total = photoDeliveries.length

      for (const d of photoDeliveries) {
        if (!d.photoUrl) continue
        try {
          const blob = await fetchImageAsBlob(d.photoUrl)
          const gc = d.gc
          const gcName = gc?.name ?? "unknown"
          const tribeName = gc?.tribe ?? "unknown"
          const date = new Date(d.deliveredAt).toISOString().split("T")[0]
          const type = d.type === "BASKET" ? "cesta" : "roupa"
          const ext = blob.type.split("/")[1] || "jpg"
          const fileName = `${date}_${tribeName}_${gcName}_${type}_${d.quantity}x.${ext}`
          folder.file(fileName, blob)
        } catch {
          // Ignora erro em uma foto individual
        }
        completed++
      }

      const content = await zip.generateAsync({ type: "blob" })
      const period = `${startDate}_a_${endDate}`
      saveAs(content, `comprovantes_${period}.zip`)
    } catch (err) {
      console.error("Erro ao gerar ZIP:", err)
    } finally {
      setDownloading(false)
    }
  }, [photoDeliveries, startDate, endDate])

  const periodLabel = `${new Date(startDate).toLocaleDateString("pt-BR")} — ${new Date(endDate).toLocaleDateString("pt-BR")}`

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Baixe comprovantes de entregas por período
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4 border p-4 bg-card">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="flex items-center gap-1 text-xs">
            <Calendar className="size-3" /> Data inicial
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="flex items-center gap-1 text-xs">
            <Calendar className="size-3" /> Data final
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tribe" className="flex items-center gap-1 text-xs">
            <Filter className="size-3" /> Tribo
          </Label>
          <Select value={tribeFilter} onValueChange={(v) => v && setTribeFilter(v)}>
            <SelectTrigger id="tribe" className="w-36">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {tribes.map((t) => (
                <SelectItem key={t} value={t}>
                  {TRIBE_CONFIG[t]?.name ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo */}
      {!isLoading && deliveries.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="size-3.5" /> {periodLabel}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <ShoppingBag className="size-3.5 text-primary" />
            {summary.baskets} {summary.baskets === 1 ? "cesta" : "cestas"}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Shirt className="size-3.5 text-emerald-600" />
            {summary.clothes} {summary.clothes === 1 ? "peça" : "peças"}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <FileImage className="size-3.5" />
            {summary.totalPhotos} {summary.totalPhotos === 1 ? "comprovante" : "comprovantes"}
          </span>

          {photoDeliveries.length > 0 && (
            <Button
              size="sm"
              onClick={handleDownloadAll}
              disabled={downloading}
              className="ml-auto gap-1.5"
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {downloading
                ? "Compactando..."
                : `Baixar ${photoDeliveries.length} comprovantes`}
            </Button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && deliveries.length === 0 && (
        <div className="flex flex-col items-center gap-3 border border-dashed py-16 text-center text-sm text-muted-foreground">
          <FileImage className="size-10 text-muted-foreground/50" />
          <p>Nenhuma entrega encontrada no período.</p>
          <p className="text-xs">Ajuste as datas e tente novamente.</p>
        </div>
      )}

      {/* Lista de entregas com foto */}
      {!isLoading && deliveries.length > 0 && (
        <div className="space-y-2">
          {photoDeliveries.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">
                Comprovantes ({photoDeliveries.length})
              </h2>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {photoDeliveries.map((d) => (
                  <DeliveryPhotoCard
                    key={d.id}
                    delivery={d}
                    gcName={d.gc?.name ?? "—"}
                    tribeName={
                      TRIBE_CONFIG[d.gc?.tribe ?? ""]?.name ?? d.gc?.tribe ?? "—"
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lista completa de entregas */}
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
              Ver todas as {deliveries.length} entregas do período
            </summary>
            <div className="mt-2 space-y-1">
              {deliveries.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 border px-3 py-2 text-xs"
                >
                  {d.type === "BASKET" ? (
                    <ShoppingBag className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <Shirt className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className="font-medium">
                    {d.type === "BASKET" ? "Cesta" : "Roupa"} x{d.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    {d.gc?.name ?? "—"} ({TRIBE_CONFIG[d.gc?.tribe ?? ""]?.name ?? d.gc?.tribe ?? "—"})
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {new Date(d.deliveredAt).toLocaleDateString("pt-BR")}
                  </span>
                  {d.photoUrl ? (
                    <a
                      href={d.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground/50 text-[10px]">Sem foto</span>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
