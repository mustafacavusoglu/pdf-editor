"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Type, PenTool } from "lucide-react"
import { SignatureDialog } from "@/components/signature-dialog"

interface ToolbarProps {
  selectedTool: "text" | "signature" | null
  onToolSelect: (tool: "text" | "signature" | null) => void
  onAddSignature: (dataUrl: string) => void
}

export function Toolbar({ selectedTool, onToolSelect, onAddSignature }: ToolbarProps) {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)

  const handleSignatureClick = () => {
    setShowSignatureDialog(true)
  }

  const handleSignatureSave = (dataUrl: string) => {
    onAddSignature(dataUrl)
    setShowSignatureDialog(false)
  }

  return (
    <>
      <Card className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-medium text-foreground hidden sm:inline">Araçlar:</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={selectedTool === "text" ? "default" : "outline"}
              onClick={() => onToolSelect(selectedTool === "text" ? null : "text")}
              className="flex-1 sm:flex-initial"
              size="sm"
            >
              <Type className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Metin Ekle</span>
            </Button>
            <Button 
              variant={selectedTool === "signature" ? "default" : "outline"} 
              onClick={handleSignatureClick}
              className="flex-1 sm:flex-initial"
              size="sm"
            >
              <PenTool className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">İmza Ekle</span>
            </Button>
          </div>
          {selectedTool && (
            <p className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">
              {selectedTool === "text"
                ? "PDF üzerine tıklayarak metin ekleyin"
                : "İmzanızı çizin ve PDF üzerine ekleyin"}
            </p>
          )}
        </div>
      </Card>

      <SignatureDialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog} onSave={handleSignatureSave} />
    </>
  )
}
