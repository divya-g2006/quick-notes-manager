"use client"

import React from "react"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface Note {
  id: string
  title: string
  content: string
  category: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  color?: string
  order: number
}

export type NoteFormData = Omit<Note, "id" | "createdAt" | "updatedAt" | "order"> & {
  category?: string
}

interface NotesContextType {
  notes: Note[]
  filteredNotes: Note[]
  searchQuery: string
  filterType: "all" | "favorites"
  draggedNote: Note | null
  isLoading: boolean
  error: string | null
  refreshNotes: () => void
  addNote: (note: NoteFormData) => Promise<void>
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  deleteAllNotes: () => void
  toggleFavorite: (id: string) => void
  reorderNotes: (draggedId: string, targetId: string) => void
  setSearchQuery: (query: string) => void
  setFilterType: (type: "all" | "favorites") => void
  setDraggedNote: (note: Note | null) => void
  exportNotes: () => void
  importNotes: (file: File) => Promise<void>
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  editingNote: Note | null
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (note: Note) => void
  closeEditModal: () => void
  openReadModal: (note: Note) => void
  closeReadModal: () => void
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)
const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://quick-notes-manager.onrender.com"

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "favorites">("all")
  const [draggedNote, setDraggedNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isReadModalOpen, setIsReadModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [readingNote, setReadingNote] = useState<Note | null>(null)

  // Memoized filtered notes for performance
  const filteredNotes = React.useMemo(() => {
    return notes
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === "all" || (filterType === "favorites" && note.isFavorite)

        return matchesSearch && matchesFilter
      })
      .sort((a, b) => a.order - b.order)
  }, [notes, searchQuery, filterType])

  const fetchNotes = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await fetch(`${backendUrl}/api/notes`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load notes")
      }

      setNotes(
        data.map((note: any, index: number) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          order: note.order ?? index,
        })),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load notes"
      setError(message)
      console.error("Failed to load notes from API:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = useCallback(
    async (noteData: NoteFormData) => {
      try {
        setError(null)
        setIsLoading(true)

        const existingNotes = notes
        if (existingNotes.length > 0) {
          await Promise.all(
            existingNotes.map((note) =>
              fetch(`${backendUrl}/api/notes/${note.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ order: note.order + 1 }),
              }),
            ),
          )
        }

        const response = await fetch(`${backendUrl}/api/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...noteData,
            category: noteData.category || "General",
            color: noteData.color || "bg-card",
            order: 0,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || "Unable to create note")
        }

        const newNote: Note = {
          id: data.id,
          title: data.title,
          content: data.content,
          category: data.category,
          isFavorite: data.isFavorite,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          color: data.color,
          order: 0,
        }

        setNotes((prev) => prev.map((note) => ({ ...note, order: note.order + 1 })))
        setNotes((prev) => [newNote, ...prev])
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create note"
        setError(message)
        console.error("Failed to create note:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [notes],
  )

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await fetch(`${backendUrl}/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updates.title,
          content: updates.content,
          category: updates.category,
          color: updates.color,
          isFavorite: updates.isFavorite,
          order: updates.order,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Unable to update note")
      }

      setNotes((prev) =>
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                ...updates,
                title: data.title,
                content: data.content,
                category: data.category,
                color: data.color,
                order: data.order,
                isFavorite: data.isFavorite,
                updatedAt: new Date(data.updatedAt),
              }
            : note,
        ),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update note"
      setError(message)
      console.error("Failed to update note:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await fetch(`${backendUrl}/api/notes/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Unable to delete note")
      }

      setNotes((prev) => prev.filter((note) => note.id !== id))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete note"
      setError(message)
      console.error("Failed to delete note:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteAllNotes = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete all notes? This action cannot be undone.")) {
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      const existingNotes = notes
      await Promise.all(
        existingNotes.map((note) =>
          fetch(`${backendUrl}/api/notes/${note.id}`, {
            method: "DELETE",
          }),
        ),
      )
      setNotes([])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete all notes"
      setError(message)
      console.error("Failed to delete all notes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [notes])

  const toggleFavorite = useCallback(
    async (id: string) => {
      const note = notes.find((item) => item.id === id)
      if (!note) return
      await updateNote(id, { isFavorite: !note.isFavorite })
    },
    [notes, updateNote],
  )

  const reorderNotes = useCallback(
    async (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return

      const previousNotes = notes
      const draggedNote = previousNotes.find((note) => note.id === draggedId)
      const targetNote = previousNotes.find((note) => note.id === targetId)

      if (!draggedNote || !targetNote) return

      const newNotes = [...previousNotes]
      const draggedIndex = newNotes.findIndex((note) => note.id === draggedId)
      const targetIndex = newNotes.findIndex((note) => note.id === targetId)

      newNotes.splice(draggedIndex, 1)
      newNotes.splice(targetIndex, 0, draggedNote)

      const orderedNotes = newNotes.map((note, index) => ({ ...note, order: index }))

      try {
        setError(null)
        setIsLoading(true)
        await Promise.all(
          orderedNotes.map((note) =>
            fetch(`${backendUrl}/api/notes/${note.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ order: note.order }),
            }),
          ),
        )
        setNotes(orderedNotes)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to reorder notes"
        setError(message)
        console.error("Failed to reorder notes:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [notes],
  )

  const parsePdfNotes = async (file: File): Promise<any[]> => {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf")

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useWorker: false })
    const pdf = await loadingTask.promise

    let fullText = ""
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join("")
      fullText += `${pageText}\n`
    }

    const markerStart = fullText.indexOf("-----BEGIN-QUICKNOTES-JSON-----")
    const markerEnd = fullText.indexOf("-----END-QUICKNOTES-JSON-----")
    if (markerStart === -1 || markerEnd === -1 || markerEnd <= markerStart) {
      throw new Error("PDF does not contain compatible note data")
    }

    const jsonText = fullText.slice(markerStart + "-----BEGIN-QUICKNOTES-JSON-----".length, markerEnd).trim()
    return JSON.parse(jsonText)
  }

  const importNotes = useCallback(async (file: File) => {
    try {
      setError(null)
      setIsLoading(true)

      let importedNotes: any[]
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        importedNotes = await parsePdfNotes(file)
      } else {
        const text = await file.text()
        importedNotes = JSON.parse(text)
      }

      if (!Array.isArray(importedNotes)) {
        throw new Error("Invalid file format")
      }

      const validatedNotes: NoteFormData[] = importedNotes.map((note: any, index: number) => ({
        title: note.title || "Untitled",
        content: note.content || "",
        isFavorite: Boolean(note.isFavorite),
        category: note.category || "General",
        color: note.color || "bg-card",
      }))

      if (!window.confirm(`Import ${validatedNotes.length} notes? This will replace your current notes.`)) {
        return
      }

      const existingNotes = notes
      await Promise.all(
        existingNotes.map((note) =>
          fetch(`${backendUrl}/api/notes/${note.id}`, {
            method: "DELETE",
          }),
        ),
      )

      const createdNotes: Note[] = []
      for (const [index, noteData] of validatedNotes.entries()) {
        const response = await fetch(`${backendUrl}/api/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...noteData,
            order: index,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || "Unable to import notes")
        }

        createdNotes.push({
          id: data.id,
          title: data.title,
          content: data.content,
          category: data.category,
          isFavorite: data.isFavorite,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          color: data.color,
          order: data.order,
        })
      }

      setNotes(createdNotes)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import notes"
      setError(message)
      console.error("Failed to import notes:", error)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [notes])

  const exportNotes = useCallback(() => {
    const docPromise = import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      let y = 40
      const pageHeight = 820
      const lineHeight = 16

      doc.setFontSize(18)
      doc.text("QuickNotes Export", 40, y)
      y += 30

      doc.setFontSize(12)
      notes.forEach((note, index) => {
        if (y + 90 > pageHeight) {
          doc.addPage()
          y = 40
        }

        doc.text(`Title: ${note.title}`, 40, y)
        y += lineHeight
        doc.text(`Category: ${note.category}${note.isFavorite ? " ⭐" : ""}`, 40, y)
        y += lineHeight
        const contentText = note.content || "(empty)"
        const contentLines = doc.splitTextToSize(`Content: ${contentText}`, 520)
        doc.text(contentLines, 40, y)
        y += contentLines.length * lineHeight
        doc.text("-".repeat(80), 40, y)
        y += lineHeight
      })

      if (y + 40 > pageHeight) {
        doc.addPage()
        y = 40
      }
      const markerStart = "-----BEGIN-QUICKNOTES-JSON-----"
      const markerEnd = "-----END-QUICKNOTES-JSON-----"
      doc.setFontSize(8)
      doc.text(markerStart, 40, y)
      y += lineHeight
      const jsonLines = JSON.stringify(notes, null, 2).split("\n")
      jsonLines.forEach((line) => {
        if (y + lineHeight > pageHeight) {
          doc.addPage()
          y = 40
        }
        doc.text(line, 40, y)
        y += lineHeight
      })
      if (y + lineHeight > pageHeight) {
        doc.addPage()
        y = 40
      }
      doc.text(markerEnd, 40, y)

      doc.save(`quicknotes-export-${new Date().toISOString().split("T")[0]}.pdf`)
    })

    void docPromise
  }, [notes])

  const openCreateModal = useCallback(() => setIsCreateModalOpen(true), [])
  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), [])

  const openEditModal = useCallback((note: Note) => {
    setEditingNote(note)
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setEditingNote(null)
    setIsEditModalOpen(false)
  }, [])

  const openReadModal = useCallback((note: Note) => {
    setReadingNote(note)
    setIsReadModalOpen(true)
  }, [])

  const closeReadModal = useCallback(() => {
    setReadingNote(null)
    setIsReadModalOpen(false)
  }, [])

  const contextValue = React.useMemo(
    () => ({
      notes,
      filteredNotes,
      searchQuery,
      filterType,
      draggedNote,
      isLoading,
      addNote,
      updateNote,
      deleteNote,
      deleteAllNotes,
      toggleFavorite,
      reorderNotes,
      setSearchQuery,
      setFilterType,
      setDraggedNote,
      exportNotes,
      importNotes,
      error,
      refreshNotes: fetchNotes,
      isCreateModalOpen,
      isEditModalOpen,
      isReadModalOpen,
      editingNote,
      readingNote,
      openCreateModal,
      closeCreateModal,
      openEditModal,
      closeEditModal,
      openReadModal,
      closeReadModal,
    }),
    [
      notes,
      filteredNotes,
      searchQuery,
      filterType,
      draggedNote,
      isLoading,
      addNote,
      updateNote,
      deleteNote,
      deleteAllNotes,
      toggleFavorite,
      reorderNotes,
      exportNotes,
      importNotes,
      isCreateModalOpen,
      isEditModalOpen,
      isReadModalOpen,
      editingNote,
      readingNote,
      openCreateModal,
      closeCreateModal,
      openEditModal,
      closeEditModal,
      openReadModal,
      closeReadModal,
    ],
  )

  return <NotesContext.Provider value={contextValue}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
