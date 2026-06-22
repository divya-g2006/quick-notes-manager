"use client"

import { Plus, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useNotes } from "@/components/notes-context"

export function DashboardHeader() {
  const { openCreateModal } = useNotes()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <StickyNote className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">QuickNotes Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openCreateModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
