import * as React from "react"
import { cn } from "../ui/utils"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/20 bg-white/40 text-card-foreground shadow-lg backdrop-blur-[20px] dark:bg-slate-900/60 dark:border-white/10",
      className
    )}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

export { GlassCard }
