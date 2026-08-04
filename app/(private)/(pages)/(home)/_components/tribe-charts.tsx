"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TRIBE_CONFIG, TRIBE_ORDER, formatBasketValue } from "@/lib/utils"
import { ShoppingBag, Shirt, Medal, Trophy } from "lucide-react"
import type { GoalsAggregateOutput } from "@/lib/api"

const TRIBE_COLORS: Record<string, { bar: string; css: string }> = {
  sent:  { bar: "#ec4899", css: "hsl(336, 80%, 60%)" },   // rosa
  hope:  { bar: "#8b5cf6", css: "hsl(258, 90%, 66%)" },    // roxo
  hazak: { bar: "#7dd3fc", css: "hsl(199, 95%, 74%)" },    // azul bebê
}

/** Posições do ranking: ícone do lucide + cor (ouro, prata, bronze). */
const POSITION_STYLES = [
  { Icon: Trophy, color: "text-amber-500", label: "1º" },
  { Icon: Medal, color: "text-slate-400", label: "2º" },
  { Icon: Medal, color: "text-orange-400", label: "3º" },
]

interface CustomBarProps {
  x: number
  y: number
  width: number
  height: number
  fill?: string
  payload?: { tribe: string; entregue: number; meta: number }
  /** Identificador do gráfico, para IDs de clipPath não colidirem. */
  chartKey?: string
}

function CustomBar(props: CustomBarProps) {
  const { x, y, width, height, payload, chartKey = "chart" } = props
  if (!payload || height <= 0) return null

  const tribeConfig = TRIBE_CONFIG[payload.tribe]
  const color = TRIBE_COLORS[payload.tribe]?.bar ?? "var(--color-basket)"

  return (
    <g>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        radius={[6, 6, 0, 0]}
      />

      {tribeConfig && (
        <g>
          <defs>
            <clipPath id={`clip-${chartKey}-${payload.tribe}`}>
              <circle cx={x + width / 2} cy={y - 24} r={18} />
            </clipPath>
          </defs>

          <image
            href={tribeConfig.image}
            x={x + width / 2 - 18}
            y={y - 42}
            width={36}
            height={36}
            preserveAspectRatio="xMidYMid meet"
            clipPath={`url(#clip-${chartKey}-${payload.tribe})`}
            className="drop-shadow-sm"
          />
        </g>
      )}
    </g>
  )
}

interface TribeChartsProps {
  data: GoalsAggregateOutput
}

export function TribeCharts({ data }: TribeChartsProps) {
  // Ordena tribes conforme TRIBE_ORDER
  const sortedTribes = TRIBE_ORDER.map((key) => {
    const tribe = data.tribes.find((t) => t.tribe === key)
    return tribe
  }).filter(Boolean)

  // Ranking por valor entregue, para exibir 1º, 2º e 3º lugar.
  const basketRanking = sortedTribes
    .slice()
    .sort((a, b) => (b!.basketDel ?? 0) - (a!.basketDel ?? 0))
  const clothesRanking = sortedTribes
    .slice()
    .sort((a, b) => (b!.clothesDel ?? 0) - (a!.clothesDel ?? 0))

  const basketData = basketRanking.map((t) => ({
    tribe: t!.tribe,
    entregue: t!.basketDel,
    meta: t!.basketGoal,
  }))

  const clothesData = clothesRanking.map((t) => ({
    tribe: t!.tribe,
    entregue: t!.clothesDel,
    meta: t!.clothesGoal,
  }))

  const chartConfig = {
    sent:  { label: "Sent",  color: TRIBE_COLORS.sent.css },
    hope:  { label: "Hope",  color: TRIBE_COLORS.hope.css },
    hazak: { label: "Hazak", color: TRIBE_COLORS.hazak.css },
  }

  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShoppingBag className="size-4 text-primary" />
            Cestas Básicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart
              data={basketData}
              margin={{ top: 50, left: 0, right: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="tribe"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={(props) => {
                  const { x, y, payload: tickPayload } = props
                  return (
                    <text x={x} y={y} dy={12} textAnchor="middle" className="fill-muted-foreground text-[11px] capitalize">
                      {tickPayload.value}
                    </text>
                  )
                }}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="entregue"
                shape={(props: any) => (
                  <CustomBar {...props} chartKey="basket" />
                )}
              />
            </BarChart>
          </ChartContainer>

          {/* Legenda com números */}
          <div className="mt-2 space-y-1.5">
            {basketRanking.map((t, i) => {
              const tribeConfig = TRIBE_CONFIG[t!.tribe]
              const color = TRIBE_COLORS[t!.tribe]?.css
              const pct = t!.basketGoal > 0
                ? Math.round((t!.basketDel / t!.basketGoal) * 100)
                : 0
              const pos = POSITION_STYLES[i]
              return (
                <div
                  key={t!.tribe}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    {pos && (
                      <span
                        className={`flex shrink-0 items-center gap-0.5 ${pos.color}`}
                        title={pos.label}
                      >
                        <pos.Icon className="size-4" />
                        <span className="text-[10px] font-bold">{pos.label}</span>
                      </span>
                    )}
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color ?? "var(--color-basket)" }}
                    />
                    {tribeConfig && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tribeConfig.image}
                        alt={t!.tribe}
                        className="size-5 rounded-full object-cover"
                      />
                    )}
                    <span className="text-xs font-medium capitalize text-foreground">
                      {t!.tribe}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatBasketValue(t!.basketDel)}
                    <span className="text-muted-foreground/50"> / {formatBasketValue(t!.basketGoal)}</span>
                    <span className="ml-1.5 font-medium text-foreground">
                      ({pct}%)
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Roupas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shirt className="size-4 text-emerald-600" />
            Roupas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart
              data={clothesData}
              margin={{ top: 50, left: 0, right: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="tribe"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={(props) => {
                  const { x, y, payload: tickPayload } = props
                  return (
                    <text x={x} y={y} dy={12} textAnchor="middle" className="fill-muted-foreground text-[11px] capitalize">
                      {tickPayload.value}
                    </text>
                  )
                }}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="entregue"
                shape={(props: any) => (
                  <CustomBar {...props} chartKey="clothes" />
                )}
              />
            </BarChart>
          </ChartContainer>

          {/* Legenda com números */}
          <div className="mt-2 space-y-1.5">
            {clothesRanking.map((t, i) => {
              const tribeConfig = TRIBE_CONFIG[t!.tribe]
              const color = TRIBE_COLORS[t!.tribe]?.css
              const pct = t!.clothesGoal > 0
                ? Math.round((t!.clothesDel / t!.clothesGoal) * 100)
                : 0
              const pos = POSITION_STYLES[i]
              return (
                <div
                  key={t!.tribe}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    {pos && (
                      <span
                        className={`flex shrink-0 items-center gap-0.5 ${pos.color}`}
                        title={pos.label}
                      >
                        <pos.Icon className="size-4" />
                        <span className="text-[10px] font-bold">{pos.label}</span>
                      </span>
                    )}
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color ?? "var(--color-clothes)" }}
                    />
                    {tribeConfig && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tribeConfig.image}
                        alt={t!.tribe}
                        className="size-5 rounded-full object-cover"
                      />
                    )}
                    <span className="text-xs font-medium capitalize text-foreground">
                      {t!.tribe}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {t!.clothesDel}
                    <span className="text-muted-foreground/50"> / {t!.clothesGoal}</span>
                    <span className="ml-1.5 font-medium text-foreground">
                      ({pct}%)
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
