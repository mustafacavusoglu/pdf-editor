"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { SignatureItem } from "./pdf-editor"
import { X, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Draggable } from "@/components/draggable"

interface SignatureElementProps {
  item: SignatureItem
  onUpdate: (item: SignatureItem) => void
  onDelete: () => void
  isSelected: boolean
  onSelect: () => void
}

export function SignatureElement({ item, onUpdate, onDelete, isSelected, onSelect }: SignatureElementProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: item.width, height: item.height })
  const aspectRatio = item.width / item.height

  // Close cropping mode when clicking outside
  useEffect(() => {
    if (!isCropping) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Don't close if clicking on crop controls
      if (target.closest('.crop-controls') || target.closest('.crop-handle')) {
        return
      }
      setIsCropping(false)
      setCropArea({ x: 0, y: 0, width: item.width, height: item.height })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCropping, item.width, item.height])

  const handlePositionChange = (x: number, y: number) => {
    onUpdate({
      ...item,
      x,
      y
    })
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = item.width
    const startHeight = item.height
    
    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      
      // Use the larger delta to maintain aspect ratio
      const delta = Math.max(deltaX, deltaY)
      
      const newWidth = Math.max(50, startWidth + delta)
      const newHeight = newWidth / aspectRatio
      
      onUpdate({
        ...item,
        width: newWidth,
        height: newHeight
      })
    }
    
    const handleResizeEnd = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
    
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  const handleCropStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsCropping(true)
  }

  const handleApplyCrop = async () => {
    try {
      // Create a canvas to crop the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Load the image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = item.dataUrl

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Calculate scaling factor between displayed size and actual image size
      const scaleX = img.naturalWidth / item.width
      const scaleY = img.naturalHeight / item.height

      // Calculate crop area in actual image coordinates
      const cropX = cropArea.x * scaleX
      const cropY = cropArea.y * scaleY
      const cropWidth = cropArea.width * scaleX
      const cropHeight = cropArea.height * scaleY

      // Set canvas size to crop area (in actual image size)
      canvas.width = cropWidth
      canvas.height = cropHeight

      // Draw the cropped portion from the original image
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      )

      // Get the cropped image as data URL
      const croppedDataUrl = canvas.toDataURL('image/png')

      // Update the item with cropped image, maintaining displayed size
      onUpdate({
        ...item,
        dataUrl: croppedDataUrl,
        width: cropArea.width,
        height: cropArea.height
      })

      setIsCropping(false)
      setCropArea({ x: 0, y: 0, width: cropArea.width, height: cropArea.height })
    } catch (error) {
      console.error('Failed to crop image:', error)
      setIsCropping(false)
    }
  }

  const handleCropDrag = (corner: 'tl' | 'tr' | 'bl' | 'br', e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startCrop = { ...cropArea }

    const handleDragMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newCrop = { ...startCrop }

      switch (corner) {
        case 'tl':
          newCrop.x = Math.max(0, Math.min(startCrop.x + deltaX, startCrop.x + startCrop.width - 20))
          newCrop.y = Math.max(0, Math.min(startCrop.y + deltaY, startCrop.y + startCrop.height - 20))
          newCrop.width = startCrop.width - (newCrop.x - startCrop.x)
          newCrop.height = startCrop.height - (newCrop.y - startCrop.y)
          break
        case 'tr':
          newCrop.y = Math.max(0, Math.min(startCrop.y + deltaY, startCrop.y + startCrop.height - 20))
          newCrop.width = Math.max(20, Math.min(startCrop.width + deltaX, item.width - startCrop.x))
          newCrop.height = startCrop.height - (newCrop.y - startCrop.y)
          break
        case 'bl':
          newCrop.x = Math.max(0, Math.min(startCrop.x + deltaX, startCrop.x + startCrop.width - 20))
          newCrop.width = startCrop.width - (newCrop.x - startCrop.x)
          newCrop.height = Math.max(20, Math.min(startCrop.height + deltaY, item.height - startCrop.y))
          break
        case 'br':
          newCrop.width = Math.max(20, Math.min(startCrop.width + deltaX, item.width - startCrop.x))
          newCrop.height = Math.max(20, Math.min(startCrop.height + deltaY, item.height - startCrop.y))
          break
      }

      setCropArea(newCrop)
    }

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
  }

  return (
    <Draggable
      initialX={item.x}
      initialY={item.y}
      onPositionChange={handlePositionChange}
      className="group"
      style={{
        width: item.width,
        height: item.height
      }}
    >
      <div 
        className="relative h-full w-full"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Border frame - shown on hover or when selected */}
        <div 
          className={`absolute inset-0 border-2 border-dashed pointer-events-none transition-opacity ${
            isSelected ? 'border-primary opacity-100' : isHovered ? 'border-primary opacity-50' : 'border-transparent opacity-0'
          }`}
          style={{ borderRadius: '4px' }}
        />
        
        <img
          src={item.dataUrl || "/placeholder.svg"}
          alt="Signature"
          className="h-full w-full object-contain"
          draggable={false}
        />
        
        {/* Crop overlay - shown when in crop mode */}
        {isCropping && (
          <>
            {/* Darkened area outside crop */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            
            {/* Crop area */}
            <div
              className="absolute border-2 border-white shadow-lg"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height
              }}
            >
              {/* Crop handles */}
              <div
                className="crop-handle absolute -top-2 -left-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-primary"
                onMouseDown={(e) => handleCropDrag('tl', e)}
              />
              <div
                className="crop-handle absolute -top-2 -right-2 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-white bg-primary"
                onMouseDown={(e) => handleCropDrag('tr', e)}
              />
              <div
                className="crop-handle absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-white bg-primary"
                onMouseDown={(e) => handleCropDrag('bl', e)}
              />
              <div
                className="crop-handle absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-primary"
                onMouseDown={(e) => handleCropDrag('br', e)}
              />
            </div>
            
            {/* Crop controls */}
            <div className="crop-controls absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation()
                  handleApplyCrop()
                }}
              >
                Uygula
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsCropping(false)
                  setCropArea({ x: 0, y: 0, width: item.width, height: item.height })
                }}
              >
                İptal
              </Button>
            </div>
          </>
        )}
        
        {/* Corner resize handles - only shown when selected and not cropping */}
        {isSelected && !isCropping && (
          <>
            <div className="absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
            <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
            <div
              className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-full border-2 border-primary bg-white"
              onMouseDown={handleResizeStart}
              style={{ touchAction: 'none' }}
            />
            
            {/* Crop button - scissors icon */}
            <Button
              size="sm"
              variant="outline"
              className="absolute -top-10 left-1/2 -translate-x-1/2 h-8 w-8 p-0 bg-white border-2 border-primary hover:bg-primary hover:text-white"
              onClick={handleCropStart}
              title="Kırp"
            >
              <Scissors className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <Button
          size="sm"
          variant="destructive"
          className={`absolute -right-8 -top-2 h-6 w-6 p-0 transition-opacity ${
            isHovered && !isCropping ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Draggable>
  )
}
