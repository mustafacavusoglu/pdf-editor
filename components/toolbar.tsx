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
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">Araçlar:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedTool === "text" ? "default" : "outline"}
              onClick={() => onToolSelect(selectedTool === "text" ? null : "text")}
            >
              <Type className="mr-2 h-4 w-4" />
              Metin Ekle
            </Button>
            <Button variant={selectedTool === "signature" ? "default" : "outline"} onClick={handleSignatureClick}>
              <PenTool className="mr-2 h-4 w-4" />
              İmza Ekle
            </Button>
          </div>
          {selectedTool && (
            <p className="text-sm text-muted-foreground">
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
