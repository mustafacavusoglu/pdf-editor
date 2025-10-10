"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { FileUpload } from "@/components/file-upload"
import { FileText, Image, PenTool } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PDFEditor = dynamic(() => import("@/components/pdf-editor").then(mod => ({ default: mod.PDFEditor })), {
  ssr: false,
})

const ImageToPDF = dynamic(() => import("@/components/image-to-pdf").then(mod => ({ default: mod.ImageToPDF })), {
  ssr: false,
})

type Module = "home" | "pdf-sign" | "image-to-pdf"

export default function Home() {
  const [currentModule, setCurrentModule] = useState<Module>("home")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  // PDF İmzalama modülü
  if (currentModule === "pdf-sign") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <PenTool className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">PDF İmzalama</h1>
                <p className="text-sm text-muted-foreground">PDF'lerinizi imzalayın ve düzenleyin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {!pdfFile ? (
            <FileUpload 
              onFileSelect={setPdfFile} 
              onBack={() => setCurrentModule("home")}
            />
          ) : (
            <PDFEditor file={pdfFile} onBack={() => {
              setPdfFile(null)
              setCurrentModule("home")
            }} />
          )}
        </main>
      </div>
    )
  }

  // Resimden PDF modülü
  if (currentModule === "image-to-pdf") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Image className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Resimden PDF Oluştur</h1>
                <p className="text-sm text-muted-foreground">Resimlerinizi PDF'e dönüştürün</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <ImageToPDF onBack={() => setCurrentModule("home")} />
        </main>
      </div>
    )
  }

  // Ana ekran - Modül seçimi
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PDF Araçları</h1>
              <p className="text-sm text-muted-foreground">Profesyonel PDF düzenleme ve dönüştürme araçları</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {/* PDF İmzalama Modülü */}
          <Card className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
            <Button
              variant="ghost"
              className="h-full w-full p-0"
              onClick={() => setCurrentModule("pdf-sign")}
            >
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary group-hover:scale-110">
                  <PenTool className="h-10 w-10 text-primary transition-all group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">PDF İmzalama</h2>
                  <p className="text-sm text-muted-foreground">
                    PDF dosyalarınıza imza ekleyin, metin yazın ve düzenleyin
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">İmza Ekle</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Metin Ekle</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Düzenle</span>
                </div>
              </div>
            </Button>
          </Card>

          {/* Resimden PDF Modülü */}
          <Card className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
            <Button
              variant="ghost"
              className="h-full w-full p-0"
              onClick={() => setCurrentModule("image-to-pdf")}
            >
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary group-hover:scale-110">
                  <Image className="h-10 w-10 text-primary transition-all group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Resimden PDF</h2>
                  <p className="text-sm text-muted-foreground">
                    Resimleri yükleyin, sıralayın ve PDF'e dönüştürün
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Çoklu Yükleme</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Sıralama</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">PDF Oluştur</span>
                </div>
              </div>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
