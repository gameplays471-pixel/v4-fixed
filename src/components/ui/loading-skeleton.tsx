"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps extends React.ComponentProps<"div"> {
  className?: string;
}

export function LoadingSkeleton({ className, ...props }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse-slow rounded-xl bg-muted/30",
        className
      )}
      {...props}
    />
  );
}
