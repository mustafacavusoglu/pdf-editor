"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onBack?: () => void
}

export function FileUpload({ onFileSelect, onBack }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const pdfFile = files.find((file) => file.type === "application/pdf")

      if (pdfFile) {
        onFileSelect(pdfFile)
      }
    },
    [onFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === "application/pdf") {
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  return (
    <div className="mx-auto max-w-3xl">
      {onBack && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </div>
      )}
      
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-3xl font-bold text-balance text-foreground md:text-4xl">PDF Dosyanızı Yükleyin</h2>
        <p className="text-lg text-muted-foreground text-pretty">
          Metin ekleyin, imza atın ve PDF'inizi kolayca düzenleyin
        </p>
      </div>

      <Card
        className={`relative overflow-hidden transition-all ${
          isDragging ? "border-primary bg-primary/5 ring-2 ring-primary" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center gap-6 p-12 md:p-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-10 w-10 text-primary" />
          </div>

          <div className="text-center">
            <p className="mb-2 text-lg font-medium text-foreground">PDF dosyasını buraya sürükleyin</p>
            <p className="text-sm text-muted-foreground">veya</p>
          </div>

          <div>
            <Button size="lg" onClick={() => document.getElementById("file-upload")?.click()}>
              <FileText className="mr-2 h-5 w-5" />
              Dosya Seç
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <p className="text-xs text-muted-foreground">Maksimum dosya boyutu: 10MB</p>
        </div>
      </Card>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl font-bold text-primary">1</span>
          </div>
          <h3 className="mb-2 font-semibold text-foreground">PDF Yükle</h3>
          <p className="text-sm text-muted-foreground">Düzenlemek istediğiniz PDF dosyasını yükleyin</p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl font-bold text-primary">2</span>
          </div>
          <h3 className="mb-2 font-semibold text-foreground">Düzenle</h3>
          <p className="text-sm text-muted-foreground">Metin ve imza ekleyerek PDF'inizi özelleştirin</p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl font-bold text-primary">3</span>
          </div>
          <h3 className="mb-2 font-semibold text-foreground">İndir</h3>
          <p className="text-sm text-muted-foreground">Düzenlenmiş PDF'inizi bilgisayarınıza indirin</p>
        </Card>
      </div>
    </div>
  )
}
