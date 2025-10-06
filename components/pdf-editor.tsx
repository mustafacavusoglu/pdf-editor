"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Toolbar } from "@/components/toolbar"
import { TextElement } from "@/components/text-element"
import { TextDialog } from "@/components/text-dialog"
import { SignatureElement } from "@/components/signature-element"
import { Download, ArrowLeft, ZoomIn, ZoomOut } from "lucide-react"
import "/public/styles/annotation-layer.css"
import "/public/styles/text-layer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFEditorProps {
  file: File
  onBack: () => void
}

export interface TextItem {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  font: string
  pageNumber: number
}

export interface SignatureItem {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageNumber: number
}

export function PDFEditor({ file, onBack }: PDFEditorProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.2)
  const [selectedTool, setSelectedTool] = useState<"text" | "signature" | null>(null)
  const [textElements, setTextElements] = useState<TextItem[]>([])
  const [signatureElements, setSignatureElements] = useState<SignatureItem[]>([])
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [selectedElement, setSelectedElement] = useState<{type: 'text' | 'signature', id: string} | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Handle keyboard shortcuts for copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C or Cmd+C for copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement) {
        e.preventDefault()
        
        if (selectedElement.type === 'text') {
          const element = textElements.find(t => t.id === selectedElement.id)
          if (element) {
            localStorage.setItem('copiedElement', JSON.stringify({ type: 'text', data: element }))
          }
        } else if (selectedElement.type === 'signature') {
          const element = signatureElements.find(s => s.id === selectedElement.id)
          if (element) {
            localStorage.setItem('copiedElement', JSON.stringify({ type: 'signature', data: element }))
          }
        }
      }
      
      // Ctrl+V or Cmd+V for paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        const copiedData = localStorage.getItem('copiedElement')
        if (copiedData) {
          const { type, data } = JSON.parse(copiedData)
          
          if (type === 'text') {
            const newText: TextItem = {
              ...data,
              id: `text-${Date.now()}`,
              x: data.x + 20,
              y: data.y + 20
            }
            setTextElements([...textElements, newText])
          } else if (type === 'signature') {
            const newSignature: SignatureItem = {
              ...data,
              id: `signature-${Date.now()}`,
              x: data.x + 20,
              y: data.y + 20
            }
            setSignatureElements([...signatureElements, newSignature])
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, textElements, signatureElements])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const [showTextDialog, setShowTextDialog] = useState(false)
  const [newTextPosition, setNewTextPosition] = useState({ x: 0, y: 0 })
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectedTool === "text") {
      setNewTextPosition({ x, y })
      setShowTextDialog(true)
    }
  }
  
  const handleAddText = (text: string, fontSize: number, font: string) => {
    const newText: TextItem = {
      id: `text-${Date.now()}`,
      text,
      x: newTextPosition.x,
      y: newTextPosition.y,
      fontSize,
      color: "#000000",
      font,
      pageNumber: currentPage,
    }
    setTextElements([...textElements, newText])
    setSelectedTool(null)
  }

  const handleAddSignature = (dataUrl: string) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newSignature: SignatureItem = {
      id: `signature-${Date.now()}`,
      dataUrl,
      x: rect.width / 2 - 100,
      y: rect.height / 2 - 50,
      width: 200,
      height: 100,
      pageNumber: currentPage,
    }
    setSignatureElements([...signatureElements, newSignature])
    setSelectedTool(null)
  }

  const handleDownload = async () => {
    try {
      const existingPdfBytes = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      const pages = pdfDoc.getPages()

      // Embed a font that supports Turkish characters
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      
      // Add text elements to their respective pages
      for (const textItem of textElements) {
        const pageIndex = textItem.pageNumber - 1
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex]
          const { height } = page.getSize()
          
          try {
            page.drawText(textItem.text, {
              x: textItem.x / scale,
              y: height - textItem.y / scale,
              size: textItem.fontSize,
              color: rgb(0, 0, 0),
              font: font,
            })
          } catch (error) {
            console.error('Error drawing text:', error)
            // If text contains unsupported characters, try to replace them
            const safText = textItem.text
              .replace(/ğ/g, 'g')
              .replace(/Ğ/g, 'G')
              .replace(/ü/g, 'u')
              .replace(/Ü/g, 'U')
              .replace(/ş/g, 's')
              .replace(/Ş/g, 'S')
              .replace(/ı/g, 'i')
              .replace(/İ/g, 'I')
              .replace(/ö/g, 'o')
              .replace(/Ö/g, 'O')
              .replace(/ç/g, 'c')
              .replace(/Ç/g, 'C')
            
            page.drawText(safText, {
              x: textItem.x / scale,
              y: height - textItem.y / scale,
              size: textItem.fontSize,
              color: rgb(0, 0, 0),
              font: font,
            })
          }
        }
      }

      // Add signature elements to their respective pages
      for (const sigItem of signatureElements) {
        const pageIndex = sigItem.pageNumber - 1
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex]
          const { height } = page.getSize()
          
          const imageBytes = await fetch(sigItem.dataUrl).then((res) => res.arrayBuffer())
          const image = await pdfDoc.embedPng(imageBytes)
          
          // Get the actual image dimensions to preserve aspect ratio
          const imageDims = image.size()
          const imageAspectRatio = imageDims.width / imageDims.height
          
          // Use the display width, but calculate height based on actual image aspect ratio
          const displayWidth = sigItem.width / scale
          const displayHeight = displayWidth / imageAspectRatio
          
          page.drawImage(image, {
            x: sigItem.x / scale,
            y: height - (sigItem.y / scale) - displayHeight,
            width: displayWidth,
            height: displayHeight,
          })
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `edited-${file.name}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Error downloading PDF:", error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            // Temizleme işlemi ve geri dönme
            setTextElements([]);
            setSignatureElements([]);
            localStorage.removeItem("savedSignatures");
            onBack();
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Button variant="ghost" size="sm" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setScale(Math.min(2, scale + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleDownload} size="lg">
            <Download className="mr-2 h-4 w-4" />
            PDF'i İndir
          </Button>
        </div>
      </div>

      <Toolbar selectedTool={selectedTool} onToolSelect={setSelectedTool} onAddSignature={handleAddSignature} />
      
      <TextDialog 
        open={showTextDialog} 
        onOpenChange={setShowTextDialog} 
        onSave={handleAddText}
        initialText="Metin ekleyin"
        initialFontSize={16}
        initialFont="Arial, sans-serif"
      />

      <Card className="overflow-hidden">
        <div className="relative bg-muted/30 p-4 md:p-8">
          <div
            ref={containerRef}
            className="relative mx-auto cursor-crosshair bg-white shadow-lg"
            onClick={(e) => {
              handleCanvasClick(e)
              setSelectedElement(null)
            }}
            style={{ width: "fit-content" }}
          >
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page 
                pageNumber={currentPage} 
                scale={scale} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            {textElements
              .filter(item => item.pageNumber === currentPage)
              .map((item) => (
                <TextElement
                  key={item.id}
                  item={item}
                  isSelected={selectedElement?.type === 'text' && selectedElement?.id === item.id}
                  onSelect={() => setSelectedElement({type: 'text', id: item.id})}
                  onUpdate={(updated) => {
                    setTextElements(textElements.map((t) => (t.id === item.id ? updated : t)))
                  }}
                  onDelete={() => {
                    setTextElements(textElements.filter((t) => t.id !== item.id))
                    setSelectedElement(null)
                  }}
                />
              ))}

            {signatureElements
              .filter(item => item.pageNumber === currentPage)
              .map((item) => (
                <SignatureElement
                  key={item.id}
                  item={item}
                  isSelected={selectedElement?.type === 'signature' && selectedElement?.id === item.id}
                  onSelect={() => setSelectedElement({type: 'signature', id: item.id})}
                  onUpdate={(updated) => {
                    setSignatureElements(signatureElements.map((s) => (s.id === item.id ? updated : s)))
                  }}
                  onDelete={() => {
                    setSignatureElements(signatureElements.filter((s) => s.id !== item.id))
                    setSelectedElement(null)
                  }}
                />
              ))}
          </div>

          {numPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <span className="text-sm text-foreground">
                Sayfa {currentPage} / {numPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                disabled={currentPage === numPages}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
