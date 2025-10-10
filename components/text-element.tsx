"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { TextItem } from "./pdf-editor"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Draggable } from "@/components/draggable"

interface TextElementProps {
  item: TextItem
  onUpdate: (item: TextItem) => void
  onDelete: () => void
  isSelected: boolean
  onSelect: () => void
}

export function TextElement({ item, onUpdate, onDelete, isSelected, onSelect }: TextElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialFontSize = useRef(item.fontSize)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Close editing mode when clicking outside
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsEditing(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isEditing])

  const handlePositionChange = (x: number, y: number) => {
    onUpdate({
      ...item,
      x,
      y
    })
  }

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const startFontSize = item.fontSize
    
    const handleResizeMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY
      const deltaY = currentY - startY
      const newFontSize = Math.max(8, Math.min(200, startFontSize + deltaY / 2))
      
      onUpdate({
        ...item,
        fontSize: newFontSize
      })
    }
    
    const handleResizeEnd = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleResizeMove as EventListener)
      document.removeEventListener('mouseup', handleResizeEnd)
      document.removeEventListener('touchmove', handleResizeMove as EventListener)
      document.removeEventListener('touchend', handleResizeEnd)
    }
    
    document.addEventListener('mousemove', handleResizeMove as EventListener)
    document.addEventListener('mouseup', handleResizeEnd)
    document.addEventListener('touchmove', handleResizeMove as EventListener, { passive: false })
    document.addEventListener('touchend', handleResizeEnd)
  }

  return (
    <Draggable
      initialX={item.x}
      initialY={item.y}
      onPositionChange={handlePositionChange}
      className="group"
    >
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
          if (isSelected) {
            setIsEditing(true);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={item.text}
            onChange={(e) => onUpdate({ ...item, text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditing(false)
            }}
            className="border-2 border-primary bg-white px-2 py-1 text-foreground outline-none"
            style={{ fontSize: item.fontSize }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="relative inline-block">
            {/* Border frame - shown on hover or when selected */}
            <div 
              className={`absolute inset-0 border-2 border-dashed pointer-events-none transition-opacity ${
                isSelected ? 'border-primary opacity-100' : isHovered ? 'border-primary opacity-50' : 'border-transparent opacity-0'
              }`}
              style={{ borderRadius: '4px', margin: '-4px' }}
            />
            
            <span className="select-none text-foreground" style={{ 
              fontSize: item.fontSize, 
              color: item.color,
              fontFamily: item.font || "Arial, sans-serif"
            }}>
              {item.text}
            </span>
            
            {/* Corner resize handles - only shown when selected */}
            {isSelected && (
              <>
                <div className="absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
                <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
                <div
                  className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-3 sm:w-3 cursor-ns-resize rounded-full border-2 border-primary bg-white touch-none"
                  onMouseDown={handleResizeStart}
                  onTouchStart={handleResizeStart}
                  style={{ touchAction: 'none' }}
                />
              </>
            )}
            
            <Button
              size="sm"
              variant="destructive"
              className={`absolute -right-7 sm:-right-8 -top-2 h-7 w-7 sm:h-6 sm:w-6 p-0 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <X className="h-4 w-4 sm:h-3 sm:w-3" />
            </Button>
          </div>
        )}
      </div>
    </Draggable>
  )
}
