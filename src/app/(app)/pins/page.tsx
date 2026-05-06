"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  GripVertical,
  X,
  Plus,
  Star,
  Save,
  HelpCircle,
  Info,
  ExternalLink,
  Circle
} from "lucide-react"
import { fetchPinnedItems, fetchPinnableRepos } from "@/lib/github/pins"
import { useToast } from "@/components/ui/Toast"
import type { Pin } from "@/types"

export default function PinsPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()

  const { data: remotePinnedItems, isLoading: pinsLoading } = useQuery({
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
  const [showWhyModal, setShowWhyModal] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Load from LocalStorage or GitHub initially
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem(`gitfit_pins_${session?.user?.email}`)
    if (saved) {
      try {
        setLocalPins(JSON.parse(saved))
        return
      } catch (e) {
        console.error("Failed to parse saved pins", e)
      }
    }

    if (remotePinnedItems && localPins === null) {
      setLocalPins([...remotePinnedItems])
    }
  }, [remotePinnedItems, localPins, session?.user?.email])

  const pins = localPins || []

  // Check if current local state differs from saved LocalStorage state
  const hasUnsavedChanges = useMemo(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(`gitfit_pins_${session?.user?.email}`)
    if (!saved) return localPins !== null && localPins.length > 0
    return JSON.stringify(localPins) !== saved
  }, [localPins, session?.user?.email])

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

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return
    const newPins = [...pins]
    const [moved] = newPins.splice(dragIndex, 1)
    newPins.splice(index, 0, moved)
    setLocalPins(newPins)
    setDragIndex(null)
  }

  const handleSave = () => {
    if (!localPins) return
    localStorage.setItem(`gitfit_pins_${session?.user?.email}`, JSON.stringify(localPins))
    addToast({ type: "success", message: "Dashboard pins saved!" })
  }

  const availableRepos = useMemo(() => {
    if (!pinnableRepos) return []
    const pinnedIds = new Set(pins.map((p) => p.id))
    return pinnableRepos.filter((r) => !pinnedIds.has(r.id))
  }, [pinnableRepos, pins])

  if (!session) return <div style={{ padding: 40, textAlign: "center" }}>Please sign in.</div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, animation: "fadeInDown 300ms ease-out both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700 }}>
            Dashboard Pins
          </h1>
          <button 
            onClick={() => setShowWhyModal(true)}
            style={{ 
              display: "flex", alignItems: "center", gap: 4, 
              fontSize: "var(--text-xs)", color: "var(--accent-primary)",
              background: "var(--accent-glow)", padding: "4px 10px",
              borderRadius: "var(--radius-full)", fontWeight: 600,
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.filter = "none"}
          >
            <HelpCircle size={12} />
            Why can't I sync to GitHub?
          </button>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: 600, lineHeight: 1.6 }}>
          Curate your most important repositories for quick access within the GitFit workbench. 
          Note: These pins are specific to your dashboard experience.
        </p>
      </div>

      {/* Grid */}
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
              padding: "20px",
              cursor: "grab",
              position: "relative",
              opacity: dragIndex === i ? 0.5 : 1,
              transition: "all var(--transition-base)"
            }}
          >
            <div style={{ position: "absolute", top: 18, left: 8, color: "var(--text-muted)" }}>
              <GripVertical size={14} />
            </div>
            <button
              onClick={() => removePin(pin.id)}
              style={{ position: "absolute", top: 12, right: 12, color: "var(--text-muted)", padding: 4 }}
            >
              <X size={16} />
            </button>
            <div style={{ paddingLeft: 12 }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                {pin.name}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                {pin.primaryLanguage && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Circle size={8} fill={pin.primaryLanguage.color} stroke="none" />
                    {pin.primaryLanguage.name}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} /> {pin.stargazerCount}
                </span>
              </div>
            </div>
          </div>
        ))}

        {pins.length < 6 && !pinsLoading && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              border: "2px dashed var(--border-default)", borderRadius: "var(--radius-lg)",
              padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              color: "var(--text-muted)", cursor: "pointer", background: "transparent",
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-default)"}
          >
            <Plus size={24} />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Pin Repository</span>
          </button>
        )}
      </div>

      {hasUnsavedChanges && (
        <div style={{ animation: "fadeInUp 250ms ease-out both" }}>
          <button
            onClick={handleSave}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "12px 32px", background: "var(--accent-primary)", color: "var(--text-inverse)",
              fontWeight: 600, borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)",
              cursor: "pointer", transition: "all var(--transition-fast)"
            }}
          >
            <Save size={16} />
            Save Layout
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddPinModal repos={availableRepos} onAdd={addPin} onClose={() => setShowAddModal(false)} />
      )}

      {showWhyModal && (
        <WhyModal onClose={() => setShowWhyModal(false)} />
      )}
    </div>
  )
}

function WhyModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", animation: "fadeIn 200ms ease-out" }} />
      <div style={{ 
        position: "relative", background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)", padding: "32px", maxWidth: 500, width: "100%",
        animation: "scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "var(--accent-glow)", padding: 8, borderRadius: "var(--radius-md)" }}>
            <Info size={24} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>
            GitHub API Limitation
          </h2>
        </div>
        
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 16 }}>
          <p>
            Currently, GitHub manages profile pins through an <strong>internal, private API</strong> that is not yet exposed to third-party developers or OAuth applications.
          </p>
          <p>
            Because these endpoints are restricted to the official GitHub web interface, GitFit can help you organize and curate your most important work right here, but we cannot push these reorders back to your public GitHub profile.
          </p>
          <p>
            We've built this "Dashboard Pins" feature to ensure you still have a high-velocity, personalized view of your workbench every time you log in.
          </p>
          
          <div style={{ 
            marginTop: 8, padding: "12px 16px", background: "var(--bg-surface)", 
            borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <ExternalLink size={14} color="var(--accent-primary)" />
            <a 
              href="https://github.com/orgs/community/discussions/24180" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
            >
              Follow the GitHub API Discussion
            </a>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ 
            marginTop: 28, width: "100%", padding: "12px", 
            background: "var(--bg-surface)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", fontWeight: 600, color: "var(--text-primary)",
            cursor: "pointer", transition: "all var(--transition-fast)"
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

function AddPinModal({ repos, onAdd, onClose }: any) {
  const [search, setSearch] = useState("")
  const filtered = repos.filter((r: any) => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", animation: "fadeIn 200ms ease-out" }} />
      <div style={{ position: "relative", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", padding: 24, borderRadius: 16, width: "100%", maxWidth: 460, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: 16 }}>Add Dashboard Pin</h2>
        <input
          type="text" placeholder="Search your repositories..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 8, marginBottom: 16, color: "var(--text-primary)" }}
        />
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((repo: any) => (
            <button 
              key={repo.id} onClick={() => onAdd(repo)} 
              style={{ 
                width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, 
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "background var(--transition-fast)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Plus size={14} color="var(--accent-primary)" />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{repo.name}</span>
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>★ {repo.stargazerCount}</span>
            </button>
          ))}
        </div>
        <button 
          onClick={onClose} 
          style={{ width: "100%", marginTop: 20, padding: 12, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 8, fontWeight: 600, color: "var(--text-secondary)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
