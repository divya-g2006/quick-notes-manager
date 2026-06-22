"use client"

import type React from "react"

import { Search, Heart, Grid3X3, Trash2, Download, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotes } from "@/components/notes-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRef } from "react"

export function NotesToolbar() {
  const {
    notes,
    filteredNotes,
    searchQuery,
    filterType,
    setSearchQuery,
    setFilterType,
    deleteAllNotes,
    exportNotes,
    importNotes,
  } = useNotes()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const favoriteCount = notes.filter((note) => note.isFavorite).length

  const handleExport = () => {
    exportNotes()
    toast.success("Notes exported successfully!")
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importNotes(file)
      toast.success("Notes imported successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import notes")
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Notes</h2>
          <p className="text-muted-foreground mt-1">
            {filteredNotes.length} of {notes.length} {notes.length === 1 ? "note" : "notes"}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-64"
          />
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className={cn("transition-all", filterType === "all" && "bg-primary text-primary-foreground")}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            All
            <Badge variant="secondary" className="ml-2">
              {notes.length}
            </Badge>
          </Button>

          <Button
            variant={filterType === "favorites" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("favorites")}
            className={cn("transition-all", filterType === "favorites" && "bg-primary text-primary-foreground")}
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites
            <Badge variant="secondary" className="ml-2">
              {favoriteCount}
            </Badge>
          </Button>

          {/* Export/Import */}
          {notes.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" size="sm" onClick={handleImportClick} className="bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                aria-label="Import notes file"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={deleteAllNotes}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
