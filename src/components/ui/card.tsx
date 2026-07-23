import * as React from "react"
import { cn } from "@/lib/utils"

// Usa style inline para garantir que var(--card-bg) seja aplicado
// independente do Tailwind v4 resolver bg-card ou não.
function Card({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      style={{ backgroundColor: "var(--card-bg)", color: "var(--fg)", ...style }}
      className={cn("rounded-2xl border shadow-sm", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      style={{ color: "var(--muted-fg)", ...style }}
      className={cn("text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
