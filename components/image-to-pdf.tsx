"use client"

import type React from "react"

import { useState, useRef } from "react"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, Download, Trash2, GripVertical, X } from "lucide-react"

interface ImageToPDFProps {
  onBack: () => void
}

interface ImageItem {
  id: string
  file: File
  preview: string
  name: string
}

export function ImageToPDF({ onBack }: ImageToPDFProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [pdfName, setPdfName] = useState<string>("document")
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files).filter(file => file.type.startsWith("image/"))
    
    const newImages: ImageItem[] = []
    
    for (const file of fileArray) {
      const reader = new FileReader()
      
      const imageData = await new Promise<string>((resolve) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      })
      
      const imageItem: ImageItem = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: imageData,
        name: file.name
      }
      newImages.push(imageItem)
    }
    
    setImages([...images, ...newImages])

    // Input'u sıfırla
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (id: string) => {
    setImages(images.filter(img => img.id !== id))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedItem = newImages[draggedIndex]
    
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    
    setImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[index - 1]
    newImages[index - 1] = temp
    setImages(newImages)
  }

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return
    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[index + 1]
    newImages[index + 1] = temp
    setImages(newImages)
  }

  const createPDF = async () => {
    if (images.length === 0) return

    setIsCreating(true)

    try {
      const pdfDoc = await PDFDocument.create()

      for (const imageItem of images) {
        const imageBytes = await imageItem.file.arrayBuffer()
        
        let image
        if (imageItem.file.type === "image/png") {
          image = await pdfDoc.embedPng(imageBytes)
        } else if (imageItem.file.type === "image/jpeg" || imageItem.file.type === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBytes)
        } else {
          // Diğer formatlar için PNG'ye dönüştür
          const img = new Image()
          img.src = imageItem.preview
          await new Promise((resolve) => {
            img.onload = resolve
          })

          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            const pngDataUrl = canvas.toDataURL("image/png")
            const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer())
            image = await pdfDoc.embedPng(pngBytes)
          } else {
            continue
          }
        }

        // Resim boyutlarını al
        const imageDims = image.size()
        
        // A4 boyutları (595 x 842 points)
        const pageWidth = 595
        const pageHeight = 842
        
        // Resmi sayfa boyutuna sığacak şekilde ölçeklendir
        let scaledWidth = imageDims.width
        let scaledHeight = imageDims.height
        
        const widthRatio = pageWidth / imageDims.width
        const heightRatio = pageHeight / imageDims.height
        const scale = Math.min(widthRatio, heightRatio, 1)
        
        scaledWidth = imageDims.width * scale
        scaledHeight = imageDims.height * scale
        
        // Sayfayı oluştur
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        
        // Resmi ortala
        const x = (pageWidth - scaledWidth) / 2
        const y = (pageHeight - scaledHeight) / 2
        
        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        })
      }

      // PDF'i kaydet
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `${pdfName || "document"}.pdf`
      link.click()
      
      URL.revokeObjectURL(url)
      
      // Başarılı mesajı göster
      alert("PDF başarıyla oluşturuldu!")
    } catch (error) {
      console.error("PDF oluşturma hatası:", error)
      alert("PDF oluşturulurken bir hata oluştu!")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-0">
      {/* Header Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Button>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Resim Ekle ({images.length})
          </Button>
          
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={createPDF}
            disabled={images.length === 0 || isCreating}
          >
            <Download className="mr-2 h-4 w-4" />
            {isCreating ? "Oluşturuluyor..." : "PDF Oluştur"}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* PDF İsmi */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <Label htmlFor="pdf-name" className="text-sm font-medium">PDF Dosya Adı</Label>
            <Input
              id="pdf-name"
              type="text"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              placeholder="document"
              className="mt-1"
            />
          </div>
          <div className="text-sm text-muted-foreground self-center sm:self-end pb-2">
            .pdf
          </div>
        </div>
      </Card>

      {/* Resim Listesi veya Boş Durum */}
      {images.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Resim Yükleyin</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PDF oluşturmak için bir veya daha fazla resim yükleyin
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Resim Seç
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Yüklenen Resimler ({images.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              Sıralamak için resimleri sürükleyip bırakın veya ok butonlarını kullanın
            </p>
          </div>
          
          <div className="space-y-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 rounded-lg border-2 bg-card p-3 transition-all ${
                  draggedIndex === index ? "border-primary opacity-50" : "border-border"
                }`}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Sıra Numarası */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>

                {/* Resim Önizleme */}
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Dosya İsmi */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{image.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(image.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                {/* Kontrol Butonları */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                    title="Yukarı taşı"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                    className="h-8 w-8 p-0"
                    title="Aşağı taşı"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveImage(image.id)}
                    className="h-8 w-8 p-0"
                    title="Sil"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Alt Butonlar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setImages([])}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Tümünü Temizle
            </Button>
            <Button
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Daha Fazla Resim Ekle
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

