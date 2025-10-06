"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TextDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialText?: string
  initialFontSize?: number
  initialFont?: string
  onSave: (text: string, fontSize: number, font: string) => void
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72]

const FONTS = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" },
]

export function TextDialog({
  open,
  onOpenChange,
  initialText = "",
  initialFontSize = 16,
  initialFont = "Arial, sans-serif",
  onSave,
}: TextDialogProps) {
  const [text, setText] = useState(initialText)
  const [fontSize, setFontSize] = useState(initialFontSize)
  const [font, setFont] = useState(initialFont)

  const handleSave = () => {
    onSave(text, fontSize, font)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Metin Ekle</DialogTitle>
          <DialogDescription>Metninizi düzenleyin ve özelleştirin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="text">Metin</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Metninizi girin"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="font">Yazı Tipi</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger id="font">
                  <SelectValue placeholder="Yazı tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((fontOption) => (
                    <SelectItem key={fontOption.value} value={fontOption.value}>
                      {fontOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="font-size">Yazı Boyutu</Label>
              <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(Number(value))}>
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Boyut seçin" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-2 rounded-md border border-border p-4">
            <p className="text-center" style={{ fontFamily: font, fontSize: `${fontSize}px` }}>
              {text || "Örnek Metin"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
