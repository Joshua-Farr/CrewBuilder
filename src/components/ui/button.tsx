import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", { variants: { variant: { default: "bg-primary text-primary-foreground shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 hover:bg-sky-300", secondary: "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-violet-500", outline: "border border-border bg-white/5 text-foreground hover:bg-white/10", ghost: "hover:bg-white/10", destructive: "bg-destructive text-white hover:bg-rose-400" }, size: { default: "h-11 px-5", sm: "h-9 px-4 text-xs", lg: "h-12 px-7 text-base", icon: "size-10" } }, defaultVariants: { variant: "default", size: "default" } });
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => { const Comp = asChild ? Slot : "button"; return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />; });
Button.displayName = "Button";
export { Button, buttonVariants };
