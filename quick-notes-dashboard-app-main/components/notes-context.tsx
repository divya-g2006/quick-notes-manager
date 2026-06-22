"use client"

import React from "react"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface Note {
  id: string
  title: string
  content: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  color?: string
  order: number
}

interface NotesContextType {
  notes: Note[]
  filteredNotes: Note[]
  searchQuery: string
  filterType: "all" | "favorites"
  draggedNote: Note | null
  isLoading: boolean
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt" | "order">) => void
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

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "favorites">("all")
  const [draggedNote, setDraggedNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  // Debounced save to localStorage
  const saveToStorage = useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout
      return (notesToSave: Note[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          localStorage.setItem("quicknotes-data", JSON.stringify(notesToSave))
        }, 300)
      }
    }, []),
    [],
  )

  // Load notes from localStorage on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = localStorage.getItem("quicknotes-data")
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes).map((note: any, index: number) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            order: note.order ?? index,
          }))
          setNotes(parsedNotes)
        } else {
          // Add sample notes for demo
          const sampleNotes: Note[] = [
            {
              id: "1",
              title: "Welcome to QuickNotes!",
              content:
                "This is your first note. Click the heart to favorite it, or click anywhere to edit. You can also drag and drop notes to reorder them!\n\nFeatures:\n✓ Create, edit, delete notes\n✓ Search and filter\n✓ Drag and drop reordering\n✓ Dark/light mode\n✓ Export/import data",
              isFavorite: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              color: "bg-yellow-100 dark:bg-yellow-900/40",
              order: 0,
            },
            {
              id: "2",
              title: "Meeting Notes - Q1 Planning",
              content:
                "Discuss project timeline and deliverables for Q1. Key points:\n- Review budget allocation\n- Set milestone dates\n- Assign team responsibilities\n- Schedule follow-up meetings",
              isFavorite: false,
              createdAt: new Date(Date.now() - 86400000),
              updatedAt: new Date(Date.now() - 86400000),
              color: "bg-blue-100 dark:bg-blue-900/40",
              order: 1,
            },
            {
              id: "3",
              title: "Feature Ideas",
              content:
                "New feature ideas for the dashboard:\n- Dark mode toggle ✓\n- Export notes to JSON ✓\n- Categories and tags\n- Collaborative editing\n- Mobile app version\n- Drag and drop reordering ✓\n- Rich text editing",
              isFavorite: true,
              createdAt: new Date(Date.now() - 172800000),
              updatedAt: new Date(Date.now() - 172800000),
              color: "bg-green-100 dark:bg-green-900/20",
              order: 2,
            },
            {
              id: "4",
              title: "Shopping List",
              content:
                "Weekly groceries:\n- Milk\n- Bread\n- Eggs\n- Fruits (apples, bananas)\n- Vegetables (spinach, carrots)\n- Coffee beans\n- Greek yogurt\n- Olive oil",
              isFavorite: false,
              createdAt: new Date(Date.now() - 259200000),
              updatedAt: new Date(Date.now() - 259200000),
              color: "bg-pink-100 dark:bg-pink-900/40",
              order: 3,
            },
          ]
          setNotes(sampleNotes)
        }
      } catch (error) {
        console.error("Failed to load notes from localStorage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (!isLoading && notes.length >= 0) {
      saveToStorage(notes)
    }
  }, [notes, isLoading, saveToStorage])

  const addNote = useCallback((noteData: Omit<Note, "id" | "createdAt" | "updatedAt" | "order">) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
    }
    setNotes((prev) => [newNote, ...prev.map((note) => ({ ...note, order: note.order + 1 }))])
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note)))
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  const deleteAllNotes = useCallback(() => {
    if (window.confirm("Are you sure you want to delete all notes? This action cannot be undone.")) {
      setNotes([])
      localStorage.removeItem("quicknotes-data")
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date() } : note)),
    )
  }, [])

  const reorderNotes = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return

    setNotes((prev) => {
      const draggedNote = prev.find((note) => note.id === draggedId)
      const targetNote = prev.find((note) => note.id === targetId)

      if (!draggedNote || !targetNote) return prev

      const newNotes = [...prev]
      const draggedIndex = newNotes.findIndex((note) => note.id === draggedId)
      const targetIndex = newNotes.findIndex((note) => note.id === targetId)

      newNotes.splice(draggedIndex, 1)
      newNotes.splice(targetIndex, 0, draggedNote)

      return newNotes.map((note, index) => ({ ...note, order: index }))
    })
  }, [])

  const exportNotes = useCallback(() => {
    const dataStr = JSON.stringify(notes, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `quicknotes-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [notes])

  const importNotes = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const importedNotes = JSON.parse(text)

      if (!Array.isArray(importedNotes)) {
        throw new Error("Invalid file format")
      }

      const validatedNotes: Note[] = importedNotes.map((note: any, index: number) => ({
        id: note.id || Date.now().toString() + index,
        title: note.title || "Untitled",
        content: note.content || "",
        isFavorite: Boolean(note.isFavorite),
        createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
        color: note.color || "bg-card",
        order: note.order ?? index,
      }))

      if (window.confirm(`Import ${validatedNotes.length} notes? This will replace your current notes.`)) {
        setNotes(validatedNotes)
      }
    } catch (error) {
      console.error("Failed to import notes:", error)
      throw new Error("Failed to import notes. Please check the file format.")
    }
  }, [])

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
