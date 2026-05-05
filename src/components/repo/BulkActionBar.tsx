"use client"

import {
  Archive,
  ArchiveRestore,
  Lock,
  Unlock,
  Tags,
  Pencil,
  Trash2,
  X,
} from "lucide-react"

interface BulkActionBarProps {
  selectedCount: number
  onArchive: () => void
  onUnarchive: () => void
  onPrivatize: () => void
  onPublicize: () => void
  onTag: () => void
  onRename: () => void
  onDelete: () => void
  onDismiss: () => void
  isLoading?: boolean
}

export function BulkActionBar({
  selectedCount,
  onArchive,
  onUnarchive,
  onPrivatize,
  onPublicize,
  onTag,
  onRename,
  onDelete,
  onDismiss,
  isLoading,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-xl)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "var(--shadow-lg)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
        animation:
          "bulkBarAppear 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        maxWidth: "calc(100vw - 32px)",
        overflowX: "auto",
      }}
    >
      {/* Count */}
      <span
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--accent-primary)",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-mono)",
        }}
      >
        {selectedCount} selected
      </span>

      <Divider />

      <ActionBtn
        icon={<Archive size={15} />}
        label="Archive"
        onClick={onArchive}
        disabled={isLoading}
      />
      <ActionBtn
        icon={<ArchiveRestore size={15} />}
        label="Unarchive"
        onClick={onUnarchive}
        disabled={isLoading}
      />
      <ActionBtn
        icon={<Lock size={15} />}
        label="Privatize"
        onClick={onPrivatize}
        disabled={isLoading}
      />
      <ActionBtn
        icon={<Unlock size={15} />}
        label="Publicize"
        onClick={onPublicize}
        disabled={isLoading}
      />
      <ActionBtn
        icon={<Tags size={15} />}
        label="Tag"
        onClick={onTag}
        disabled={isLoading}
      />
      <ActionBtn
        icon={<Pencil size={15} />}
        label="Rename"
        onClick={onRename}
        disabled={isLoading}
      />

      <Divider />

      <ActionBtn
        icon={<Trash2 size={15} />}
        label="Delete"
        onClick={onDelete}
        danger
        disabled={isLoading}
      />

      <Divider />

      <button
        onClick={onDismiss}
        style={{
          color: "var(--text-muted)",
          padding: 4,
          display: "flex",
          transition: "color var(--transition-fast)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--text-secondary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-muted)")
        }
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes bulkBarAppear {
          from {
            transform: translateX(-50%) translateY(120%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  const baseColor = danger ? "var(--accent-danger)" : "var(--text-secondary)"
  const hoverBg = danger ? "var(--accent-danger-glow)" : "var(--bg-hover)"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 10px",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: baseColor,
        borderRadius: "var(--radius-md)",
        transition: "all var(--transition-fast)",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: "var(--border-default)",
        flexShrink: 0,
      }}
    />
  )
}
