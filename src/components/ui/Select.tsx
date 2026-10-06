"use client"

import { useState, useRef, useEffect, useId } from "react"
import { ChevronDown, Check } from "lucide-react"

interface Option<T extends string | number> {
  value: T
  label: string
}

interface SelectProps<T extends string | number> {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  variant?: "pill" | "rect"
  style?: React.CSSProperties
}

export function Select<T extends string | number>({ value, onChange, options, variant = "pill", style }: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSelect = (val: T) => {
    onChange(val)
    setIsOpen(false)
  }

  const isPill = variant === "pill"

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: isPill ? "6px 28px 6px 12px" : "8px 32px 8px 14px",
          fontSize: isPill ? "var(--text-xs)" : "var(--text-sm)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          color: "var(--text-secondary)",
          background: "var(--bg-elevated)",
          borderRadius: isPill ? "var(--radius-full)" : "var(--radius-md)",
          border: isOpen ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all var(--transition-fast)",
          userSelect: "none",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = "var(--border-default)"
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = "var(--border-subtle)"
        }}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown
          size={12}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform var(--transition-fast)",
            color: "var(--text-muted)",
          }}
        />
      </button>

      {/* Dropdown Options Menu */}
      {isOpen && (
        <div
          role="listbox"
          id={listboxId}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 1000,
            minWidth: "100%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: "6px",
            maxHeight: 280,
            overflowY: "auto",
            animation: "scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: isPill ? "var(--text-xs)" : "var(--text-sm)",
                  fontFamily: "var(--font-body)",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "var(--accent-primary)" : "var(--text-secondary)",
                  background: isSelected ? "var(--bg-hover)" : "transparent",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-hover)"
                  if (!isSelected) e.currentTarget.style.color = "var(--text-primary)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected ? "var(--bg-hover)" : "transparent"
                  if (!isSelected) e.currentTarget.style.color = "var(--text-secondary)"
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={12} color="var(--accent-primary)" style={{ marginLeft: 8 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
