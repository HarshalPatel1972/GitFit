"use client"

import { useState, useCallback } from "react"
import { Tags, X, Plus } from "lucide-react"

interface BulkTopicEditorProps {
  selectedCount: number
  onAdd: (topics: string[]) => void
  onRemove: (topics: string[]) => void
  onClose: () => void
}

export function BulkTopicEditor({
  selectedCount,
  onAdd,
  onRemove,
  onClose,
}: BulkTopicEditorProps) {
  const [mode, setMode] = useState<"add" | "remove">("add")
  const [input, setInput] = useState("")
  const [topics, setTopics] = useState<string[]>([])

  const addTopic = useCallback(() => {
    const tag = input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    if (tag && !topics.includes(tag)) {
      setTopics((prev) => [...prev, tag])
    }
    setInput("")
  }, [input, topics])

  const removeTopic = useCallback((tag: string) => {
    setTopics((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleSubmit = () => {
    if (topics.length === 0) return
    if (mode === "add") onAdd(topics)
    else onRemove(topics)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          animation: "fadeIn 200ms ease-out",
        }}
      />

      <div
        style={{
          position: "relative",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "24px 28px",
          maxWidth: 460,
          width: "100%",
          animation: "scaleIn 200ms ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <Tags size={20} color="var(--accent-primary)" />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
            }}
          >
            {mode === "add" ? "Add" : "Remove"} Topics
          </h2>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ({selectedCount} repos)
          </span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["add", "remove"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "6px 14px",
                fontSize: "var(--text-sm)",
                fontWeight: mode === m ? 600 : 400,
                color:
                  mode === m
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
                background:
                  mode === m ? "var(--accent-glow)" : "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid",
                borderColor:
                  mode === m
                    ? "var(--accent-primary)"
                    : "var(--border-subtle)",
                textTransform: "capitalize",
                transition: "all var(--transition-fast)",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Topic input */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <input
            type="text"
            placeholder="Enter topic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTopic()
              }
            }}
            autoFocus
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={addTopic}
            style={{
              padding: "8px 12px",
              background: "var(--accent-glow)",
              color: "var(--accent-primary)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              transition: "all var(--transition-fast)",
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Topic chips */}
        {topics.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 16,
            }}
          >
            {topics.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  background: "var(--accent-glow)",
                  color: "var(--accent-primary)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {tag}
                <button
                  onClick={() => removeTopic(tag)}
                  style={{
                    color: "var(--accent-primary)",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={topics.length === 0}
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: topics.length > 0 ? "var(--text-inverse)" : "var(--text-muted)",
              background: topics.length > 0 ? "var(--accent-primary)" : "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              opacity: topics.length > 0 ? 1 : 0.5,
              cursor: topics.length > 0 ? "pointer" : "not-allowed",
              transition: "all var(--transition-base)",
            }}
          >
            {mode === "add" ? "Add" : "Remove"} {topics.length} topic
            {topics.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  )
}
