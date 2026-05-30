"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
}

export function Slider({ className, value, onValueChange, max = 100, step = 1, ...props }: SliderProps) {
  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={value[0] ?? 0}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary",
        "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md",
        className,
      )}
      {...props}
    />
  );
}
