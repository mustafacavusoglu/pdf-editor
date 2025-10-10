"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Trash2, Upload, Image, PenTool } from "lucide-react"

interface SignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (dataUrl: string) => void
}

export function SignatureDialog({ open, onOpenChange, onSave }: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw")
  const [savedSignatures, setSavedSignatures] = useState<string[]>([])
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)
  const [penColor, setPenColor] = useState<string>("#000000")

  useEffect(() => {
    if (open && canvasRef.current && activeTab === "draw") {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    
    // Load saved signatures from localStorage
    if (open) {
      const saved = localStorage.getItem("savedSignatures")
      if (saved) {
        try {
          const signatures = JSON.parse(saved)
          if (Array.isArray(signatures)) {
            setSavedSignatures(signatures)
          }
        } catch (e) {
          console.error("Failed to parse saved signatures", e)
        }
      }
    }
  }, [open, activeTab])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    // Adjust coordinates based on canvas scaling
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: x * scaleX,
      y: y * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e)

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e)

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.strokeStyle = penColor
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        const dataUrl = event.target.result
        setSelectedSignature(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }
  
  const handleSave = () => {
    let signatureDataUrl: string | null = null
    
    if (activeTab === "draw") {
      const canvas = canvasRef.current
      if (!canvas) return
      signatureDataUrl = canvas.toDataURL("image/png")
    } else if (activeTab === "upload" && selectedSignature) {
      signatureDataUrl = selectedSignature
    } else if (selectedSignature) {
      signatureDataUrl = selectedSignature
    }
    
    if (!signatureDataUrl) return
    
    // Save to localStorage
    const updatedSignatures = [...savedSignatures]
    if (!updatedSignatures.includes(signatureDataUrl)) {
      updatedSignatures.push(signatureDataUrl)
      setSavedSignatures(updatedSignatures)
      localStorage.setItem("savedSignatures", JSON.stringify(updatedSignatures))
    }
    
    onSave(signatureDataUrl)
    onOpenChange(false)
  }
  
  const handleSelectSavedSignature = (dataUrl: string) => {
    setSelectedSignature(dataUrl)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İmza Ekle</DialogTitle>
          <DialogDescription>İmzanızı çizin, yükleyin veya kayıtlı imzalarınızdan seçin</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "draw" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">
              <PenTool className="mr-2 h-4 w-4" />
              İmza Çiz
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              İmza Yükle
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="draw" className="space-y-4">
            <div className="overflow-hidden rounded-lg border-2 border-border bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Renk:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPenColor("#000000")}
                    className={`h-8 w-8 rounded-full border-2 ${
                      penColor === "#000000" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: "#000000" }}
                    title="Siyah"
                  />
                  <button
                    onClick={() => setPenColor("#0000FF")}
                    className={`h-8 w-8 rounded-full border-2 ${
                      penColor === "#0000FF" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: "#0000FF" }}
                    title="Mavi"
                  />
                  <button
                    onClick={() => setPenColor("#FF0000")}
                    className={`h-8 w-8 rounded-full border-2 ${
                      penColor === "#FF0000" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: "#FF0000" }}
                    title="Kırmızı"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={clearCanvas} className="flex-1 sm:flex-initial bg-transparent">
                <Trash2 className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Image className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">İmza resminizi yükleyin</p>
                <p className="text-xs text-muted-foreground">PNG, JPG veya GIF formatında</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Dosya Seç
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {selectedSignature && activeTab === "upload" && (
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <img 
                    src={selectedSignature} 
                    alt="Yüklenen imza" 
                    className="max-h-[200px] w-auto object-contain"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {savedSignatures.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Kayıtlı İmzalar</h3>
            <div className="grid grid-cols-3 gap-3">
              {savedSignatures.map((sig, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer rounded-lg border-2 p-2 ${
                    selectedSignature === sig ? "border-primary" : "border-border"
                  }`}
                  onClick={() => handleSelectSavedSignature(sig)}
                >
                  <img src={sig} alt={`Kayıtlı imza ${index + 1}`} className="h-20 w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSave}>İmzayı Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
