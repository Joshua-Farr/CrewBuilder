"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function LeaderSparkline({
  data,
  color,
  className,
}: {
  data: Array<{ v: number }>;
  color: string;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!data.length) {
    return <div className={cn("h-10 rounded-lg bg-muted/40", className)} />;
  }

  if (!mounted) {
    return <div className={cn("h-10 rounded-lg bg-muted/40", className)} />;
  }

  return (
    <div className={cn("h-10 w-full min-w-[5rem]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={color}
            fillOpacity={0.18}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
