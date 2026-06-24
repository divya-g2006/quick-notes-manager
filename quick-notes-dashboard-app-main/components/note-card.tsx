"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Edit, Trash2, MoreVertical, Copy, ExternalLink, GripVertical, BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotes, type Note } from "@/components/notes-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const { toggleFavorite, deleteNote, openEditModal, openReadModal, addNote, reorderNotes, draggedNote, setDraggedNote } = useNotes()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(note.id)
    toast.success(note.isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openEditModal(note)
  }

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openReadModal(note)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(note.id)
      toast.success("Note deleted successfully")
    }
  }

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    addNote({
      title: `${note.title} (Copy)`,
      content: note.content,
      isFavorite: false,
      color: note.color,
    })
    toast.success("Note duplicated successfully")
  }

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`)
    toast.success("Note content copied to clipboard")
  }

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      let y = 40
      const lineHeight = 16

      doc.setFontSize(18)
      doc.text(note.title || "Untitled Note", 40, y)
      y += 30

      doc.setFontSize(12)
      const lines = doc.splitTextToSize(note.content || "", 520)
      doc.text(lines, 40, y)
      y += lines.length * lineHeight + 10

      doc.setFontSize(10)
      doc.text(`Updated: ${formatDate(note.updatedAt)}`, 40, y)

      const safeTitle = note.title?.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() || "note"
      doc.save(`${safeTitle}.pdf`)
      toast.success("Note downloaded")
    } catch (error) {
      console.error("Failed to download note:", error)
      toast.error("Failed to download note")
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedNote(note)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", note.id)

    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(5deg)"
    dragImage.style.opacity = "0.8"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation()
    setDraggedNote(null)
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const draggedId = e.dataTransfer.getData("text/plain")
    if (draggedId && draggedId !== note.id) {
      reorderNotes(draggedId, note.id)
      toast.success("Notes reordered successfully")
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const isDragging = draggedNote?.id === note.id

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in",
        note.color || "bg-card",
        "border-border/50 hover:border-border",
        isDragging && "opacity-50 scale-95 rotate-2",
        isDragOver && "ring-2 ring-primary ring-offset-2 scale-105",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isDragging && openEditModal(note)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              <GripVertical className="h-4 w-4 text-gray-600 dark:text-gray-300 cursor-grab active:cursor-grabbing" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-balance flex-1">
              {note.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 hover:bg-white/60 dark:hover:bg-white/10",
                note.isFavorite && "text-red-500 hover:text-red-600",
              )}
              onClick={handleFavoriteClick}
            >
              <Heart
                className={cn("h-4 w-4 transition-all", note.isFavorite ? "fill-current animate-pulse-heart" : "")}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/60 dark:hover:bg-white/10 text-gray-600 dark:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleReadClick}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicateClick}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyClick}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 dark:text-white line-clamp-4 mb-4 whitespace-pre-wrap">{note.content}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white">
          <span>Updated {formatDate(note.updatedAt)}</span>
          {note.isFavorite && <Heart className="h-3 w-3 fill-red-500 text-red-500" />}
        </div>
      </CardContent>
    </Card>
  )
}
