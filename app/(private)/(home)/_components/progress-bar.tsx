import { cn } from "@/lib/utils"

interface ProgressBarProps {
  current: number
  goal: number
}

export function ProgressBar({ current, goal }: ProgressBarProps) {
  const pct = Math.min((current / goal) * 100, 100)
  const isComplete = current >= goal

  const progressColor = isComplete
    ? "bg-primary"
    : pct > 50
      ? "bg-chart-2"
      : "bg-chart-5"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span
          className={cn(
            isComplete
              ? "font-medium text-primary"
              : "text-muted-foreground",
          )}
        >
          {isComplete
            ? "Meta atingida!"
            : `${current}/${goal} entregues`}
        </span>
        <span className="font-medium tabular-nums text-foreground">
          {Math.round(pct)}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", progressColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!isComplete && (
        <p className="text-xs text-muted-foreground">
          Faltam{" "}
          <span className="font-medium text-foreground">
            {goal - current}
          </span>{" "}
          para completar a meta
        </p>
      )}
    </div>
  )
}
