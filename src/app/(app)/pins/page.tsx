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
  Circle,
  Search
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(`gitfit_pins_${session?.user?.email}`)
    if (saved) {
      try {
        setLocalPins(JSON.parse(saved))
        return
      } catch (e) {}
    }
    if (remotePinnedItems && localPins === null) {
      setLocalPins([...remotePinnedItems])
    }
  }, [remotePinnedItems, localPins, session?.user?.email])

  const pins = localPins || []

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

  // LIVE REORDER LOGIC
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
    
    // Create a transparent drag ghost
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement
    ghost.style.opacity = "0.5"
    ghost.style.position = "absolute"
    ghost.style.top = "-1000px"
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleDragEnter = (index: number) => {
    if (dragIndex === null || dragIndex === index) return
    
    const newPins = [...pins]
    const item = newPins[dragIndex]
    newPins.splice(dragIndex, 1)
    newPins.splice(index, 0, item)
    
    setLocalPins(newPins)
    setDragIndex(index)
  }

  const handleDragEnd = () => {
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
          >
            <HelpCircle size={12} />
            Why can't I sync to GitHub?
          </button>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: 600, lineHeight: 1.6 }}>
          Curate your workbench. These pins are persistent in your GitFit dashboard.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
        {pins.map((pin, i) => (
          <div
            key={pin.id}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              cursor: "grab",
              position: "relative",
              opacity: dragIndex === i ? 0.3 : 1,
              transform: dragIndex === i ? "scale(0.98)" : "scale(1)",
              transition: "transform 150ms ease, opacity 150ms ease, border-color 150ms ease",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: dragIndex === i ? 10 : 1
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-default)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-subtle)"}
          >
            <div style={{ position: "absolute", top: 22, left: 8, color: "var(--text-muted)" }}>
              <GripVertical size={14} />
            </div>
            
            <button
              onClick={() => removePin(pin.id)}
              style={{ position: "absolute", top: 14, right: 14, color: "var(--text-muted)", padding: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-danger)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <X size={16} />
            </button>

            <div style={{ paddingLeft: 12 }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, paddingRight: 20 }}>
                {pin.name}
              </h3>
              
              {pin.description && (
                <p style={{ 
                  fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.5, 
                  marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, 
                  WebkitBoxOrient: "vertical", overflow: "hidden" 
                }}>
                  {pin.description}
                </p>
              )}
            </div>

            <div style={{ paddingLeft: 12, display: "flex", alignItems: "center", gap: 16, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {pin.primaryLanguage && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Circle size={8} fill={pin.primaryLanguage.color} stroke="none" />
                  {pin.primaryLanguage.name}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={12} /> {pin.stargazerCount}
              </span>
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
              transition: "all var(--transition-fast)", minHeight: 140, justifyContent: "center"
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
            Save Dashboard Layout
          </button>
        </div>
      )}

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
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", animation: "fadeIn 200ms ease-out" }} />
      <div style={{ 
        position: "relative", background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)", padding: "40px", maxWidth: 540, width: "100%",
        animation: "scaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "var(--accent-glow)", padding: 10, borderRadius: "var(--radius-lg)" }}>
            <Info size={28} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700 }}>
            GitHub API Limitations
          </h2>
        </div>
        
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 20 }}>
          <p>
            You might have noticed that changes to your pins here don't show up on your public GitHub profile. This is because GitHub currently manages profile pins through <strong>internal, private APIs</strong> that are not exposed to third-party developers or OAuth applications.
          </p>
          <p>
            Because these endpoints are restricted to GitHub's official web interface, third-party tools like GitFit can help you organize your work internally, but we cannot "push" those changes to your public profile yet.
          </p>
          <p>
            We've built <strong>Dashboard Pins</strong> to give you a high-velocity, curated view of your most important repositories right here in your workbench, independent of your public profile layout.
          </p>
          
          <div style={{ 
            marginTop: 10, padding: "16px 20px", background: "var(--bg-surface)", 
            borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <ExternalLink size={16} color="var(--accent-primary)" />
            <a 
              href="https://github.com/orgs/community/discussions?discussions_q=is%3Aopen+pinned+items+mutation" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
            >
              Search GitHub API Discussions
            </a>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{ 
            marginTop: 32, width: "100%", padding: "14px", 
            background: "var(--bg-surface)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)", fontWeight: 600, color: "var(--text-primary)",
            cursor: "pointer", transition: "all var(--transition-fast)"
          }}
        >
          I Understand
        </button>
      </div>
    </div>
  )
}

function AddPinModal({ repos, onAdd, onClose }: any) {
  const [search, setSearch] = useState("")
  const filtered = repos.filter((r: any) => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", animation: "fadeIn 200ms ease-out" }} />
      <div style={{ position: "relative", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", padding: "32px", borderRadius: 20, width: "100%", maxWidth: 500, maxHeight: "80vh", display: "flex", flexDirection: "column", animation: "scaleIn 200ms ease-out" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 20 }}>Pin to Dashboard</h2>
        
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text" placeholder="Search repositories..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus
            style={{ width: "100%", padding: "12px 14px 12px 40px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 12, color: "var(--text-primary)", fontSize: "var(--text-sm)" }}
          />
        </div>

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
          {filtered.map((repo: any) => (
            <button 
              key={repo.id} onClick={() => onAdd(repo)} 
              style={{ 
                width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 12, 
                display: "flex", flexDirection: "column", gap: 4,
                transition: "all var(--transition-fast)", background: "transparent"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>{repo.name}</span>
                <Plus size={14} color="var(--accent-primary)" />
              </div>
              {repo.description && (
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {repo.description}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              No repositories found.
            </div>
          )}
        </div>
        
        <button 
          onClick={onClose} 
          style={{ width: "100%", marginTop: 24, padding: 14, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 12, fontWeight: 600, color: "var(--text-secondary)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
