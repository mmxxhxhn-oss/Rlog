"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash2, Eye, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const menuRef = React.useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const menuWidth = 200
    const menuHeight = items.length * 40 + 16
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10)
    setPosition({ x, y })
    setOpen(true)
  }

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <div onContextMenu={handleContextMenu} className="relative inline-block">
      {children}
      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] overflow-hidden rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
          style={{ left: position.x, top: position.y }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                item.disabled
                  ? "cursor-not-allowed opacity-50"
                  : item.danger
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "hover:bg-accent"
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!item.disabled) {
                  item.onClick()
                  setOpen(false)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  if (!item.disabled) {
                    item.onClick()
                    setOpen(false)
                  }
                }
              }}
            >
              {item.icon && <span className="mr-2 w-4 h-4">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simple kebab menu button for mobile/alternative usage
export function KebabMenu({ items }: { items: ContextMenuItem[] }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 z-50 min-w-[180px] overflow-hidden rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
          {items.map((item, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                item.disabled
                  ? "cursor-not-allowed opacity-50"
                  : item.danger
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "hover:bg-accent"
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!item.disabled) {
                  item.onClick()
                  setOpen(false)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  if (!item.disabled) {
                    item.onClick()
                    setOpen(false)
                  }
                }
              }}
            >
              {item.icon && <span className="mr-2 w-4 h-4">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}