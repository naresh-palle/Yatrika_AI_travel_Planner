"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExportPdfButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.print()}
      className="gap-2 print:hidden"
    >
      <Download className="h-4 w-4" />
      Save PDF
    </Button>
  )
}
