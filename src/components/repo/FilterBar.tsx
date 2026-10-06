"use client"

import { Search } from "lucide-react"
import { Select } from "@/components/ui/Select"
import type { Filters, Visibility, Status, SortOption, FilterPreset } from "@/types"

interface FilterBarProps {
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
  languages: string[]
  totalCount: number
  filteredCount: number
  hasSelection: boolean
  allSelectedCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
}

export function FilterBar({
  filters,
  onFilterChange,
  languages,
  hasSelection,
  onSelectAll,
  onDeselectAll,
}: FilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 0",
        borderBottom: "1px solid var(--border-subtle)",
        marginBottom: 20,
        flexWrap: "wrap",
        position: "sticky",
        top: 0,
        background: "var(--bg-canvas)",
        zIndex: 10,
        animation: "fadeInDown 300ms ease-out 80ms both",
      }}
    >
      {/* Select All */}
      {hasSelection && (
        <button
          onClick={onDeselectAll}
          style={{
            padding: "6px 12px",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--accent-primary)",
            background: "var(--accent-glow)",
            borderRadius: "var(--radius-full)",
            whiteSpace: "nowrap",
            transition: "all var(--transition-fast)",
          }}
        >
          Clear
        </button>
      )}
      {!hasSelection && (
        <button
          onClick={onSelectAll}
          style={{
            padding: "6px 12px",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: "var(--text-muted)",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-full)",
            whiteSpace: "nowrap",
            border: "1px solid var(--border-subtle)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)"
          }}
        >
          Select All
        </button>
      )}

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          padding: "6px 12px",
          border: "1px solid var(--border-subtle)",
          flex: "0 1 260px",
          minWidth: 160,
          transition: "border-color var(--transition-fast)",
        }}
      >
        <Search size={14} color="var(--text-muted)" />
        <input
          type="text"
          aria-label="Search repositories"
          placeholder="Search repos..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          id="search-repos"
          style={{
            flex: 1,
            fontSize: "var(--text-sm)",
            color: "var(--text-primary)",
            minWidth: 0,
          }}
        />
      </div>

      {/* Visibility */}
      <FilterSelect
        value={filters.visibility}
        onChange={(v) => onFilterChange("visibility", v as Visibility)}
        options={[
          { value: "all", label: "All" },
          { value: "public", label: "Public" },
          { value: "private", label: "Private" },
        ]}
      />

      {/* Status */}
      <FilterSelect
        value={filters.status}
        onChange={(v) => onFilterChange("status", v as Status)}
        options={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
      />

      {/* Language */}
      <FilterSelect
        value={filters.language}
        onChange={(v) => onFilterChange("language", v)}
        options={[
          { value: "", label: "All Languages" },
          ...languages.map((l) => ({ value: l, label: l })),
        ]}
      />

      {/* Sort */}
      <FilterSelect
        value={filters.sort}
        onChange={(v) => onFilterChange("sort", v as SortOption)}
        options={[
          { value: "updated", label: "Updated" },
          { value: "name", label: "Name" },
          { value: "stars", label: "Stars" },
          { value: "size", label: "Size" },
          { value: "created", label: "Created" },
        ]}
      />

      {/* Dead repos preset */}
      <button
        onClick={() =>
          onFilterChange(
            "preset",
            filters.preset === "dead" ? ("all" as FilterPreset) : ("dead" as FilterPreset)
          )
        }
        style={{
          padding: "6px 12px",
          fontSize: "var(--text-xs)",
          fontWeight: 500,
          borderRadius: "var(--radius-full)",
          whiteSpace: "nowrap",
          border: "1px solid",
          borderColor:
            filters.preset === "dead"
              ? "var(--accent-primary)"
              : "var(--border-subtle)",
          color:
            filters.preset === "dead"
              ? "var(--accent-primary)"
              : "var(--text-muted)",
          background:
            filters.preset === "dead"
              ? "var(--accent-glow)"
              : "var(--bg-elevated)",
          transition: "all var(--transition-fast)",
        }}
      >
        🪦 Dead
      </button>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      variant="pill"
    />
  )
}
