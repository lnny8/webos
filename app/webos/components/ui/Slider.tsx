"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

type SliderProps = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  className?: string
}

export function Slider({value, min, max, step = 1, onChange, className}: SliderProps) {
  return (
    <SliderPrimitive.Root value={[value]} min={min} max={max} step={step} onValueChange={(values) => onChange(values[0] ?? value)} className={`relative flex w-full touch-none select-none items-center ${className ?? ""}`}>
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden border border-[#1a6628] bg-black">
        <SliderPrimitive.Range className="absolute h-full bg-[#1f8e3f]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 border border-[#84ff9f] bg-[#0b1a0f] focus-visible:outline-none" />
    </SliderPrimitive.Root>
  )
}
