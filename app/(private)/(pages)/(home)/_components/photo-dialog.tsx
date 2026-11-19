"use client"

import { useRef, useState } from "react"
import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  WheelEvent as ReactWheelEvent,
} from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CalendarDays,
  ImageOff,
  MessageSquareText,
  RotateCcw,
  Shirt,
  ShoppingBag,
  UserRound,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { feedItemValue, type FeedItem } from "../_data/feed"

const MIN_ZOOM = 1
const MAX_ZOOM = 8
const ZOOM_STEP = 1.6

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-xs text-foreground">{children}</span>
    </div>
  )
}

/**
 * Dialog da entrega: imagem com zoom (roda do mouse, botões, duplo clique,
 * pinch de 2 dedos no toque; arraste para pan quando ampliado) + detalhes ao
 * lado. Sem foto, mostra placeholder e só os detalhes. O conteúdo só monta
 * com uma entrega selecionada, então o zoom nasce zerado a cada abertura.
 */
export function PhotoDialog({
  item,
  onOpenChange,
}: {
  item: FeedItem | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      {item && <PhotoDialogContent item={item} />}
    </Dialog>
  )
}

function PhotoDialogContent({ item }: { item: FeedItem }) {
  const hasPhoto = Boolean(item.photo)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{
    pointerX: number
    pointerY: number
    offsetX: number
    offsetY: number
  } | null>(null)
  // Pontes ativos (toque) e referência do pinch de 2 dedos
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)

  function changeZoom(next: number) {
    const zoomed = clampZoom(next)
    setZoom(zoomed)
    if (zoomed === MIN_ZOOM) setOffset({ x: 0, y: 0 })
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (!hasPhoto) return
    changeZoom(zoom * (event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP))
  }

  function handleDoubleClick() {
    if (!hasPhoto) return
    if (zoom > MIN_ZOOM) {
      setZoom(MIN_ZOOM)
      setOffset({ x: 0, y: 0 })
    } else {
      setZoom(2.5)
    }
  }

  function pointerDistance() {
    const [a, b] = [...pointersRef.current.values()]
    if (!a || !b) return 0
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!hasPhoto) return
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    if (pointersRef.current.size >= 2) {
      // Pinch: congela o arraste e fixa a distância/zoom de referência
      dragRef.current = null
      pinchRef.current = { distance: pointerDistance(), zoom }
      return
    }

    if (zoom <= MIN_ZOOM) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!hasPhoto) return
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      })
    }

    const pinch = pinchRef.current
    if (pinch && pointersRef.current.size >= 2) {
      if (pinch.distance > 0) {
        changeZoom(pinch.zoom * (pointerDistance() / pinch.distance))
      }
      return
    }

    const drag = dragRef.current
    if (!drag) return
    setOffset({
      x: drag.offsetX + (event.clientX - drag.pointerX),
      y: drag.offsetY + (event.clientY - drag.pointerY),
    })
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    if (pointersRef.current.size < 2) pinchRef.current = null
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>
          {hasPhoto ? "Comprovante da entrega" : "Detalhes da entrega"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {hasPhoto
            ? "Imagem ampliável e detalhes da entrega"
            : "Detalhes da entrega"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
        {/* Imagem com zoom (ou placeholder quando não há foto) */}
        <div
          className="relative h-[45vh] touch-none overflow-hidden rounded-md bg-muted select-none sm:h-[60vh]"
          style={{
            cursor: !hasPhoto
              ? "default"
              : zoom > MIN_ZOOM
                ? "grab"
                : "zoom-in",
          }}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {hasPhoto ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                }}
              >
                <Image
                  src={item.photo}
                  alt={`Comprovante de ${item.user.name}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 60vw"
                  className="object-contain"
                />
              </div>

              {/* Controles de zoom */}
              <div
                className="absolute inset-x-0 bottom-2 flex justify-center"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <div className="flex items-center gap-0.5 border bg-background/90 p-1 shadow-sm backdrop-blur">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Diminuir zoom"
                    onClick={() => changeZoom(zoom / ZOOM_STEP)}
                  >
                    <ZoomOut />
                  </Button>
                  <span className="min-w-10 text-center text-[11px] font-medium tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Aumentar zoom"
                    onClick={() => changeZoom(zoom * ZOOM_STEP)}
                  >
                    <ZoomIn />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Restaurar zoom"
                    onClick={() => changeZoom(MIN_ZOOM)}
                  >
                    <RotateCcw />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-8" />
              <p className="text-xs">Sem comprovante fotográfico</p>
            </div>
          )}
        </div>

            {/* Detalhes da entrega */}
            <aside className="flex flex-col gap-3 self-start rounded-md border bg-card p-3">
              <div className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  {item.type === "Cesta Básica" ? (
                    <ShoppingBag className="size-3.5 text-primary" />
                  ) : (
                    <Shirt className="size-3.5 text-emerald-600" />
                  )}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {item.type}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  Valor
                </span>
                <span className="text-lg font-bold tabular-nums text-foreground">
                  {feedItemValue(item)}
                </span>
              </div>

              <DetailRow label="Doador">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
                  {item.user.name}
                </span>
              </DetailRow>

              <DetailRow label="Para (GC)">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5 shrink-0 text-muted-foreground" />
                  {item.gc.name} — {item.gc.tribe}
                </span>
              </DetailRow>

              <DetailRow label="Data da entrega">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                  {new Date(item.deliveredAt).toLocaleString("pt-BR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
              </DetailRow>

              <DetailRow label="Observações">
                <span className="inline-flex items-start gap-1.5">
                  <MessageSquareText className="size-3.5 shrink-0 text-muted-foreground" />
                  {item.notes?.trim() ? item.notes : "Sem observações"}
                </span>
              </DetailRow>
          </aside>
        </div>
    </DialogContent>
  )
}
