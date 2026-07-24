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
import { TRIBE_CONFIG, TRIBE_ORDER } from "@/lib/utils"
import { ShoppingBag, Shirt } from "lucide-react"
import type { GoalsAggregateOutput } from "@/lib/api"

const TRIBE_COLORS: Record<string, { bar: string; css: string }> = {
  sent:  { bar: "#ec4899", css: "hsl(336, 80%, 60%)" },   // rosa
  hope:  { bar: "#8b5cf6", css: "hsl(258, 90%, 66%)" },    // roxo
  hazak: { bar: "#7dd3fc", css: "hsl(199, 95%, 74%)" },    // azul bebê
}

interface CustomBarProps {
  x: number
  y: number
  width: number
  height: number
  fill?: string
  payload?: { tribe: string; entregue: number; meta: number }
}

function CustomBar(props: CustomBarProps) {
  const { x, y, width, height, payload } = props
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
            <clipPath id={`clip-${payload.tribe}`}>
              <circle cx={x + width / 2} cy={y - 24} r={18} />
            </clipPath>
          </defs>

          <image
            href={tribeConfig.image}
            x={x + width / 2 - 18}
            y={y - 42}
            width={36}
            height={36}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${payload.tribe})`}
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

  const basketData = sortedTribes.map((t) => ({
    tribe: t!.tribe,
    entregue: t!.basketDel,
    meta: t!.basketGoal,
  }))

  const clothesData = sortedTribes.map((t) => ({
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
    <div className="grid grid-cols-2 gap-4 px-4">
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
                  <CustomBar {...props} />
                )}
              />
            </BarChart>
          </ChartContainer>

          {/* Legenda com números */}
          <div className="mt-2 space-y-1.5">
            {sortedTribes.map((t) => {
              const tribeConfig = TRIBE_CONFIG[t!.tribe]
              const color = TRIBE_COLORS[t!.tribe]?.css
              const pct = t!.basketGoal > 0
                ? Math.round((t!.basketDel / t!.basketGoal) * 100)
                : 0
              return (
                <div
                  key={t!.tribe}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2">
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
                    {t!.basketDel}
                    <span className="text-muted-foreground/50"> / {t!.basketGoal}</span>
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
                  <CustomBar {...props} />
                )}
              />
            </BarChart>
          </ChartContainer>

          {/* Legenda com números */}
          <div className="mt-2 space-y-1.5">
            {sortedTribes.map((t) => {
              const tribeConfig = TRIBE_CONFIG[t!.tribe]
              const color = TRIBE_COLORS[t!.tribe]?.css
              const pct = t!.clothesGoal > 0
                ? Math.round((t!.clothesDel / t!.clothesGoal) * 100)
                : 0
              return (
                <div
                  key={t!.tribe}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2">
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
