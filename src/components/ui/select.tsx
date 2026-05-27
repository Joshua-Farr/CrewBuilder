import * as React from "react";
import { cn } from "@/lib/utils";
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => <select ref={ref} className={cn("h-11 w-full rounded-2xl border border-input bg-slate-950/80 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props}>{children}</select>);
Select.displayName = "Select";
export { Select };
