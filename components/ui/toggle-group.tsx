import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"

import { cn } from "@/lib/utils"

type ToggleGroupProps<T extends string> = Omit<
  ToggleGroupPrimitive.Props<string>,
  "value" | "defaultValue" | "onValueChange"
> & {
  value: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

function ToggleGroup<T extends string>({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: ToggleGroupProps<T>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "inline-flex items-center gap-0.5 border border-border bg-muted/40 p-0.5",
        className,
      )}
      value={[value]}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      onValueChange={(values) => {
        const next = values[values.length - 1] as T | undefined
        if (next !== undefined && next !== value) onValueChange?.(next)
      }}
      {...props}
    />
  )
}

function ToggleGroupItem({
  className,
  ...props
}: TogglePrimitive.Props<string>) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex h-7 items-center justify-center gap-1 border border-transparent px-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none select-none hover:bg-background/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm [&_svg]:size-3.5",
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
