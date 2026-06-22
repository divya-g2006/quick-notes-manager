"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNotes } from "@/components/notes-context"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

export function ReadNoteModal() {
  const { isReadModalOpen, closeReadModal, readingNote } = useNotes()

  if (!readingNote) return null

  return (
    <Dialog open={isReadModalOpen} onOpenChange={closeReadModal}>
      <DialogContent className="sm:max-w-2xl animate-scale-in">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl font-semibold">Read Note</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeReadModal}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{readingNote.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Updated {readingNote.updatedAt.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4 text-sm leading-7 text-foreground whitespace-pre-wrap">
            {readingNote.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
