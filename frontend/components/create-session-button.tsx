"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateSessionDialog } from "@/components/create-session-dialog"

export function CreateSessionButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-teal-800 hover:bg-teal-700 text-white">
        <Plus className="mr-2 h-4 w-4" /> Create session
      </Button>
      <CreateSessionDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
