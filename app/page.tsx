"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { FileUpload } from "@/components/file-upload"
import { FileText } from "lucide-react"

const PDFEditor = dynamic(() => import("@/components/pdf-editor").then(mod => ({ default: mod.PDFEditor })), {
  ssr: false,
})

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">PDF Düzenleyici</h1>
              <p className="text-sm text-muted-foreground">Profesyonel PDF düzenleme aracı</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!pdfFile ? (
          <FileUpload onFileSelect={setPdfFile} />
        ) : (
          <PDFEditor file={pdfFile} onBack={() => setPdfFile(null)} />
        )}
      </main>
    </div>
  )
}
