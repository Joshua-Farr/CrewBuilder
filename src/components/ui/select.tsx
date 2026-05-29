import * as React from "react";
import { cn } from "@/lib/utils";
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 dark:border-border dark:bg-card dark:text-foreground [color-scheme:light] dark:[color-scheme:dark]",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";
export { Select };
