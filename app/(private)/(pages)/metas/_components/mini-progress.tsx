interface MiniProgressProps {
  current: number
  goal: number
  color: string
  showLabel?: boolean
}

export function MiniProgress({ current, goal, color, showLabel }: MiniProgressProps) {
  const pct = Math.min((current / (goal || 1)) * 100, 100)

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {current}/{goal}
          </span>
          <span className="font-medium tabular-nums">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
