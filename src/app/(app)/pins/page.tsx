"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  GripVertical,
  X,
  Plus,
  Search,
  Star,
  Circle,
  Save,
} from "lucide-react"
import { fetchPinnedItems, fetchPinnableRepos, updatePins } from "@/lib/github/pins"
import { useToast } from "@/components/ui/Toast"
import type { Pin } from "@/types"

export default function PinsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: pinnedItems, isLoading: pinsLoading } = useQuery({
    queryKey: ["pins"],
    queryFn: fetchPinnedItems,
    enabled: !!session?.accessToken,
  })

  const { data: pinnableRepos } = useQuery({
    queryKey: ["pinnable-repos"],
    queryFn: fetchPinnableRepos,
    enabled: !!session?.accessToken,
  })

  const [localPins, setLocalPins] = useState<Pin[] | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Use local state once loaded
  const pins = localPins ?? pinnedItems ?? []

  // Sync remote data to local state
  useEffect(() => {
    if (pinnedItems && !localPins) {
      setLocalPins([...pinnedItems])
    }
  }, [pinnedItems, localPins])

  const hasChanges = useMemo(() => {
    if (!pinnedItems || !localPins) return false
    if (pinnedItems.length !== localPins.length) return true
    return pinnedItems.some((p, i) => p.id !== localPins[i]?.id)
  }, [pinnedItems, localPins])

  const removePin = useCallback((id: string) => {
    setLocalPins((prev) => (prev ? prev.filter((p) => p.id !== id) : prev))
  }, [])

  const addPin = useCallback((pin: Pin) => {
    setLocalPins((prev) => {
      if (!prev) return [pin]
      if (prev.length >= 6) return prev
      if (prev.some((p) => p.id === pin.id)) return prev
      return [...prev, pin]
    })
    setShowAddModal(false)
  }, [])

  // Drag and drop
  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    
    const newPins = [...(localPins || [])]
    const item = newPins[dragIndex]
    newPins.splice(dragIndex, 1)
    newPins.splice(index, 0, item)
    
    setLocalPins(newPins)
    setDragIndex(index)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  const handleSave = async () => {
    if (!localPins) return
    setSaving(true)
    try {
      await updatePins(localPins.map((p) => p.id))
      queryClient.setQueryData(["pins"], [...localPins])
      addToast({ type: "success", message: "Pins updated on your profile!" })
    } catch {
      addToast({ type: "error", message: "Failed to update pins" })
    } finally {
      setSaving(false)
    }
  }

  // Available repos to pin (not already pinned)
  const availableRepos = useMemo(() => {
    if (!pinnableRepos) return []
    const pinnedIds = new Set(pins.map((p) => p.id))
    return pinnableRepos.filter((r) => !pinnedIds.has(r.id))
  }, [pinnableRepos, pins])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, animation: "fadeInDown 300ms ease-out both" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: 6 }}>
          Profile Pins
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 520 }}>
          Your profile shows these pinned items. Drag to reorder. Click × to remove. Click + to add from your repos.
        </p>
      </div>

      {/* Loading */}
      {pinsLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-shimmer" style={{
              height: 120, borderRadius: "var(--radius-lg)",
              animation: `fadeInUp 250ms ease-out ${i * 40}ms both`,
            }} />
          ))}
        </div>
      )}

      {/* Pin grid */}
      {!pinsLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
          {pins.map((pin, i) => (
            <div
              key={pin.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                background: "var(--bg-surface)",
                border: `1px solid ${dragIndex === i ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                cursor: "grab",
                transition: "all var(--transition-base)",
                transform: dragIndex === i ? "scale(1.02)" : "scale(1)",
                boxShadow: dragIndex === i ? "var(--shadow-md)" : "none",
                animation: `fadeInUp 250ms ease-out ${i * 60}ms both`,
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)"
              }}
              onMouseLeave={(e) => {
                if (dragIndex !== i) e.currentTarget.style.borderColor = "var(--border-subtle)"
              }}
            >
              {/* Drag handle */}
              <div style={{ position: "absolute", top: 14, left: 8, color: "var(--text-muted)", cursor: "grab" }}>
                <GripVertical size={14} />
              </div>

              {/* Remove button */}
              <button
                onClick={() => removePin(pin.id)}
                style={{
                  position: "absolute", top: 10, right: 10,
                  color: "var(--text-muted)", padding: 4, borderRadius: "var(--radius-sm)",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-danger)"
                  e.currentTarget.style.background = "var(--accent-danger-glow)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)"
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <X size={14} />
              </button>

              <div style={{ paddingLeft: 16 }}>
                <h3 style={{
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600,
                  color: "var(--text-primary)", marginBottom: 6, paddingRight: 24,
                }}>
                  {pin.name}
                </h3>
                {pin.description && (
                  <p style={{
                    fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.5,
                    marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {pin.description}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {pin.primaryLanguage && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Circle size={7} fill={pin.primaryLanguage.color} stroke="none" />
                      {pin.primaryLanguage.name}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={11} /> {pin.stargazerCount}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Add pin slot */}
          {pins.length < 6 && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "transparent",
                border: "2px dashed var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "32px 20px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 8,
                color: "var(--text-muted)",
                transition: "all var(--transition-base)",
                minHeight: 120,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-primary)"
                e.currentTarget.style.color = "var(--accent-primary)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)"
                e.currentTarget.style.color = "var(--text-muted)"
              }}
            >
              <Plus size={24} />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>Add Pin</span>
            </button>
          )}
        </div>
      )}

      {/* Save button */}
      {hasChanges && (
        <div style={{ animation: "fadeInUp 250ms ease-out both" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px",
              background: "var(--accent-primary)", color: "var(--text-inverse)",
              fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 600,
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)", transition: "all var(--transition-base)",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.background = "var(--accent-primary-dim)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-primary)"
            }}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Pins"}
          </button>
        </div>
      )}

      {/* Add pin modal */}
      {showAddModal && (
        <AddPinModal
          repos={availableRepos}
          onAdd={addPin}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

function AddPinModal({
  repos, onAdd, onClose,
}: {
  repos: Pin[]; onAdd: (pin: Pin) => void; onClose: () => void;
}) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return repos
    const q = search.toLowerCase()
    return repos.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
    )
  }, [repos, search])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", animation: "fadeIn 200ms ease-out" }} />
      <div style={{
        position: "relative", background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)",
        padding: "24px", maxWidth: 500, width: "100%", maxHeight: "70vh",
        display: "flex", flexDirection: "column", animation: "scaleIn 200ms ease-out",
      }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 16 }}>
          Add Pin
        </h2>

        <div style={{
          display: "flex", alignItems: "center", gap: 6, background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)", padding: "8px 12px",
          border: "1px solid var(--border-subtle)", marginBottom: 16,
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text" placeholder="Search your repos..." value={search}
            onChange={(e) => setSearch(e.target.value)} autoFocus
            style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}
          />
        </div>

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((repo) => (
            <button
              key={repo.id} onClick={() => onAdd(repo)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: "transparent", borderRadius: "var(--radius-md)",
                textAlign: "left", transition: "background var(--transition-fast)", width: "100%",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Plus size={14} color="var(--accent-primary)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
                  {repo.name}
                </div>
                {repo.description && (
                  <div style={{
                    fontSize: "var(--text-xs)", color: "var(--text-muted)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {repo.description}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                <Star size={10} /> {repo.stargazerCount}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              No repos found
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 16, padding: "10px", fontSize: "var(--text-sm)", fontWeight: 600,
            color: "var(--text-secondary)", background: "var(--bg-surface)",
            border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
            transition: "all var(--transition-fast)", width: "100%",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
