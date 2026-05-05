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

  // Sync remote data to local state only once per load
  useEffect(() => {
    if (pinnedItems && localPins === null) {
      setLocalPins([...pinnedItems])
    }
  }, [pinnedItems, localPins])

  const pins = localPins || []

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
      const current = prev || []
      if (current.length >= 6) return current
      if (current.some((p) => p.id === pin.id)) return current
      return [...current, pin]
    })
    setShowAddModal(false)
  }, [])

  // Simplified Drag and Drop
  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }
  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return
    const newPins = [...pins]
    const [moved] = newPins.splice(dragIndex, 1)
    newPins.splice(index, 0, moved)
    setLocalPins(newPins)
    setDragIndex(null)
  }

  const handleSave = async () => {
    if (!localPins) return
    
    console.log("Save initiated. Total pins:", localPins.length)
    setSaving(true)
    
    try {
      const pinIds = localPins.map((p) => p.id)
      console.log("Sending IDs to server:", pinIds)
      
      const result = await updatePins(pinIds)
      console.log("Server response received:", result)
      
      if (result.success) {
        addToast({ type: "success", message: "Pins updated on your profile!" })
        await queryClient.invalidateQueries({ queryKey: ["pins"] })
        setLocalPins(null) // Reset to re-sync
      } else {
        console.error("Server reported failure:", result.error)
        addToast({ type: "error", message: result.error || "Failed to update pins" })
      }
    } catch (err: any) {
      console.error("Client-side catch-all error:", err)
      addToast({ type: "error", message: "An unexpected error occurred" })
    } finally {
      setSaving(false)
      console.log("Save process finished.")
    }
  }

  const availableRepos = useMemo(() => {
    if (!pinnableRepos) return []
    const pinnedIds = new Set(pins.map((p) => p.id))
    return pinnableRepos.filter((r) => !pinnedIds.has(r.id))
  }, [pinnableRepos, pins])

  if (!session) return <div style={{ padding: 40, textAlign: "center" }}>Please sign in to manage pins.</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: 6 }}>
          Profile Pins
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Drag to reorder. GitHub allows up to 6 pins.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
        {pins.map((pin, i) => (
          <div
            key={pin.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              cursor: "grab",
              position: "relative",
              opacity: dragIndex === i ? 0.5 : 1,
            }}
          >
            <div style={{ position: "absolute", top: 14, left: 8, color: "var(--text-muted)" }}>
              <GripVertical size={14} />
            </div>
            <button
              onClick={() => removePin(pin.id)}
              style={{ position: "absolute", top: 10, right: 10, color: "var(--text-muted)", padding: 4 }}
            >
              <X size={14} />
            </button>
            <div style={{ paddingLeft: 16 }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>
                {pin.name}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8 }}>
                {pin.primaryLanguage && <span>{pin.primaryLanguage.name}</span>}
                <span><Star size={11} style={{ verticalAlign: "middle" }} /> {pin.stargazerCount}</span>
              </div>
            </div>
          </div>
        ))}

        {pins.length < 6 && !pinsLoading && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              border: "2px dashed var(--border-default)", borderRadius: "var(--radius-lg)",
              padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              color: "var(--text-muted)", cursor: "pointer",
            }}
          >
            <Plus size={24} />
            <span>Add Pin</span>
          </button>
        )}
      </div>

      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px 28px", background: "var(--accent-primary)", color: "var(--text-inverse)",
            fontWeight: 600, borderRadius: "var(--radius-lg)", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Save Pins"}
        </button>
      )}

      {showAddModal && (
        <AddPinModal repos={availableRepos} onAdd={addPin} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}

function AddPinModal({ repos, onAdd, onClose }: any) {
  const [search, setSearch] = useState("")
  const filtered = repos.filter((r: any) => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
      <div style={{ position: "relative", background: "var(--bg-elevated)", padding: 24, borderRadius: 16, width: "100%", maxWidth: 400, maxHeight: "80vh", overflow: "auto" }}>
        <h2 style={{ marginBottom: 16 }}>Add Pin</h2>
        <input
          type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: 10, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 8, marginBottom: 16 }}
        />
        {filtered.map((repo: any) => (
          <button key={repo.id} onClick={() => onAdd(repo)} style={{ width: "100%", textAlign: "left", padding: 10, borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
            <span>{repo.name}</span>
            <Plus size={14} />
          </button>
        ))}
        <button onClick={onClose} style={{ width: "100%", marginTop: 16, padding: 10 }}>Cancel</button>
      </div>
    </div>
  )
}
