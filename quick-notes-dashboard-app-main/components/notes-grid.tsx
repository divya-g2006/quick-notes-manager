"use client"

import { useNotes } from "@/components/notes-context"
import { NoteCard } from "@/components/note-card"
import { CreateNoteModal } from "@/components/create-note-modal"
import { EditNoteModal } from "@/components/edit-note-modal"
import { NotesToolbar } from "@/components/notes-toolbar"
import { ReadNoteModal } from "@/components/read-note-modal"
import { Plus, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NotesGrid() {
  const { filteredNotes, searchQuery, filterType, openCreateModal, draggedNote } = useNotes()

  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return {
        title: "No notes found",
        description: `No notes match your search for "${searchQuery}". Try a different search term or create a new note.`,
      }
    }
    if (filterType === "favorites") {
      return {
        title: "No favorite notes",
        description:
          "You haven't favorited any notes yet. Click the heart icon on any note to add it to your favorites.",
      }
    }
    return {
      title: "No notes yet",
      description: "Create your first note to get started with organizing your thoughts and ideas.",
    }
  }

  if (filteredNotes.length === 0) {
    const emptyState = getEmptyStateMessage()

    return (
      <div className="space-y-6">
        <NotesToolbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">{emptyState.title}</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-balance">{emptyState.description}</p>
            {!searchQuery && (
              <Button
                onClick={openCreateModal}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Note
              </Button>
            )}
          </div>
        </div>
        <CreateNoteModal />
        <EditNoteModal />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto space-y-6">
      <NotesToolbar />

      {filteredNotes.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <Move className="h-4 w-4" />
          <span>Drag and drop notes to reorder them</span>
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-200",
          draggedNote && "gap-8",
        )}
      >
        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      <CreateNoteModal />
      <EditNoteModal />
      <ReadNoteModal />
    </div>
  )
}
