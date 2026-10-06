"use client"

import { useState, useMemo, useCallback, useSyncExternalStore } from "react"
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
import { unwrap } from "@/lib/result"
import { ErrorState } from "@/components/ui/ErrorState"
import { useToast } from "@/components/ui/Toast"
import type { Pin } from "@/types"

export default function PinsPage() {
  const { data: session, status } = useSession()
  const { addToast } = useToast()

  const {
    data: remotePinnedItems,
    isLoading: pinsLoading,
    isError: pinsError,
    error: pinsErrorValue,
    refetch: refetchPins,
  } = useQuery({
    queryKey: ["pins"],
    queryFn: async () => unwrap(await fetchPinnedItems()),
    enabled: status === "authenticated",
  })

  const { data: pinnableRepos } = useQuery({
    queryKey: ["pinnable-repos"],
    queryFn: async () => unwrap(await fetchPinnableRepos()),
    enabled: status === "authenticated",
  })

  // Unsaved edits. null = no edits, show the saved (or GitHub) pins.
  const [localPins, setLocalPins] = useState<Pin[] | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWhyModal, setShowWhyModal] = useState(false)

  const storageKey = session?.user?.email ? `gitfit_pins_${session.user.email}` : null
  const savedJson = useSyncExternalStore(
    subscribeToStorage,
    () => (storageKey ? readStorage(storageKey) : null),
    () => null
  )
  const savedPins = useMemo<Pin[] | null>(() => {
    if (!savedJson) return null
    try {
      return JSON.parse(savedJson)
    } catch {
      return null
    }
  }, [savedJson])

  const pins = useMemo(
    () => localPins ?? savedPins ?? remotePinnedItems ?? [],
    [localPins, savedPins, remotePinnedItems]
  )
  const hasUnsavedChanges = localPins !== null

  const removePin = useCallback(
    (id: string) => setLocalPins(pins.filter((p) => p.id !== id)),
    [pins]
  )

  const addPin = useCallback(
    (pin: Pin) => {
      if (pins.length < 6 && !pins.some((p) => p.id === pin.id)) {
        setLocalPins([...pins, pin])
      }
      setShowAddModal(false)
    },
    [pins]
  )

  // ROCK SOLID DRAG AND DROP
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString())
    e.dataTransfer.effectAllowed = "move"
    ;(e.currentTarget as HTMLElement).style.opacity = "0.4"
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.currentTarget as HTMLElement).style.opacity = "1"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    return false
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10)
    
    if (sourceIndex === targetIndex) return

    const newPins = [...pins]
    const [moved] = newPins.splice(sourceIndex, 1)
    newPins.splice(targetIndex, 0, moved)
    
    setLocalPins(newPins)
    return false
  }

  const handleSave = () => {
    if (!localPins || !storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(localPins))
      setLocalPins(null)
      addToast({ type: "success", message: "Pins saved in this browser" })
    } catch {
      addToast({ type: "error", message: "Could not save: browser storage is unavailable" })
    }
  }

  const availableRepos = useMemo(() => {
    if (!pinnableRepos) return []
    const pinnedIds = new Set(pins.map((p) => p.id))
    return pinnableRepos.filter((r) => !pinnedIds.has(r.id))
  }, [pinnableRepos, pins])

  if (status === "loading") return null
  if (!session) return <div style={{ padding: 40, textAlign: "center" }}>Please sign in.</div>

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
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
              borderRadius: "var(--radius-full)", fontWeight: 600
            }}
          >
            <HelpCircle size={12} />
            Why doesn&apos;t this change my GitHub profile?
          </button>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: 600, lineHeight: 1.6 }}>
          A private shortlist of your most important repos, saved in this browser. GitHub
          doesn&apos;t let apps change the pins on your public profile, so these stay in GitFit.
        </p>
      </div>

      {pinsError && !savedPins && <ErrorState error={pinsErrorValue} onRetry={() => refetchPins()} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
        {pins.map((pin, i) => (
          <div
            key={pin.id}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, i)}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              cursor: "grab",
              position: "relative",
              transition: "all var(--transition-base)",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              userSelect: "none"
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)")}
          >
            <div style={{ position: "absolute", top: 22, left: 8, color: "var(--text-muted)" }}>
              <GripVertical size={14} />
            </div>
            
            <button
              onClick={() => removePin(pin.id)}
              style={{ position: "absolute", top: 14, right: 14, color: "var(--text-muted)", padding: 4 }}
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
          >
            <Plus size={24} />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Pin Repository</span>
          </button>
        )}
      </div>

      {hasUnsavedChanges && (
        <div style={{ display: "flex", gap: 10, animation: "fadeInUp 250ms ease-out both" }}>
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
            Save pins
          </button>
          <button
            onClick={() => setLocalPins(null)}
            style={{
              padding: "12px 24px", fontWeight: 600, color: "var(--text-secondary)",
              background: "var(--bg-surface)", border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)", cursor: "pointer",
            }}
          >
            Discard changes
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
            GitHub currently manages profile pins through <strong>internal, private APIs</strong> that are not exposed to third-party applications.
          </p>
          <p>
            Because these endpoints are restricted, GitFit helps you organize your workbench internally, but we cannot push these changes to your public GitHub profile.
          </p>
          <p>
            We&apos;ve built <strong>Dashboard Pins</strong> to give you a high-velocity, curated view of your most important repositories right here, independent of your public profile layout.
          </p>
          
          <div style={{ 
            marginTop: 10, padding: "16px 20px", background: "var(--bg-surface)", 
            borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <ExternalLink size={16} color="var(--accent-primary)" />
            <a 
              href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
            >
              How to change your profile pins on GitHub
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

function AddPinModal({
  repos,
  onAdd,
  onClose,
}: {
  repos: Pin[]
  onAdd: (pin: Pin) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState("")
  const filtered = repos.filter((r) => 
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
          {filtered.map((repo) => (
            <button 
              key={repo.id} onClick={() => onAdd(repo)} 
              style={{ 
                width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 12, 
                display: "flex", flexDirection: "column", gap: 4,
                transition: "all var(--transition-fast)", background: "transparent"
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
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

function subscribeToStorage(listener: () => void) {
  window.addEventListener("storage", listener)
  return () => window.removeEventListener("storage", listener)
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
