"use client"

import React, { useState, useEffect, useRef, ReactNode } from 'react'

interface DraggableProps {
  initialX: number
  initialY: number
  onPositionChange: (x: number, y: number) => void
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Draggable({
  initialX,
  initialY,
  onPositionChange,
  children,
  className = "",
  style = {}
}: DraggableProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionRef = useRef({ x: initialX, y: initialY })
  
  // Update position if initialX/initialY props change
  useEffect(() => {
    setPosition({ x: initialX, y: initialY })
    positionRef.current = { x: initialX, y: initialY }
  }, [initialX, initialY])
  
  // Handle mouse down event to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default browser behavior
    e.preventDefault()
    e.stopPropagation()
    
    // Set dragging state and record starting positions
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    }
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  // Handle mouse move event during dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return
    
    // Calculate new position
    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y
    
    // Update position state and ref
    positionRef.current = { x: newX, y: newY }
    setPosition({ x: newX, y: newY })
    
    // Call callback with new position
    onPositionChange(newX, newY)
    
    // Prevent default browser behavior
    e.preventDefault()
  }
  
  // Handle mouse up event to end dragging
  const handleMouseUp = () => {
    isDraggingRef.current = false
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  // Handle touch events for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default browser behavior
    e.preventDefault()
    e.stopPropagation()
    
    // Set dragging state and record starting positions
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.touches[0].clientX - positionRef.current.x,
      y: e.touches[0].clientY - positionRef.current.y
    }
    
    // Add global event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }
  
  // Handle touch move event during dragging
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return
    
    // Calculate new position
    const newX = e.touches[0].clientX - dragStartRef.current.x
    const newY = e.touches[0].clientY - dragStartRef.current.y
    
    // Update position state and ref
    positionRef.current = { x: newX, y: newY }
    setPosition({ x: newX, y: newY })
    
    // Call callback with new position
    onPositionChange(newX, newY)
    
    // Prevent default browser behavior
    e.preventDefault()
  }
  
  // Handle touch end event to end dragging
  const handleTouchEnd = () => {
    isDraggingRef.current = false
    
    // Remove global event listeners
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
  
  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
  
  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  )
}
