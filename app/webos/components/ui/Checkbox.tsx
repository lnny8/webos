"use client"

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  ariaLabel?: string
}

export function Checkbox({checked, onChange, className, ariaLabel}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          onChange(!checked)
        }
      }}
      className={`inline-flex h-4 w-4 items-center justify-center border border-[#1a6628] bg-black text-xs leading-none text-[#84ff9f] focus-visible:outline-none ${className ?? ""}`}>
      {checked ? "✓" : ""}
    </button>
  )
}
