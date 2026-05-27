import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", { variants: { variant: { default: "border-transparent bg-primary/20 text-sky-200", secondary: "border-transparent bg-secondary/25 text-violet-100", accent: "border-transparent bg-accent/20 text-yellow-100", outline: "border-border text-foreground", danger: "border-transparent bg-rose-500/20 text-rose-100" } }, defaultVariants: { variant: "default" } });
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; }
