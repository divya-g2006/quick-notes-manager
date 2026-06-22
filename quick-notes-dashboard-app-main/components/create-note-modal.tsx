"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNotes } from "@/components/notes-context"

const noteColors = [
  { name: "Yellow", class: "bg-yellow-100 dark:bg-yellow-900/20" },
  { name: "Blue", class: "bg-blue-100 dark:bg-blue-900/20" },
  { name: "Green", class: "bg-green-100 dark:bg-green-900/20" },
  { name: "Pink", class: "bg-pink-100 dark:bg-pink-900/20" },
  { name: "Purple", class: "bg-purple-100 dark:bg-purple-900/20" },
  { name: "Default", class: "bg-card" },
]

export function CreateNoteModal() {
  const { isCreateModalOpen, closeCreateModal, addNote } = useNotes()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedColor, setSelectedColor] = useState(noteColors[0].class)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addNote({
      title: title.trim(),
      content: content.trim(),
      isFavorite: false,
      color: selectedColor,
    })

    // Reset form
    setTitle("")
    setContent("")
    setSelectedColor(noteColors[0].class)
    closeCreateModal()
  }

  const handleClose = () => {
    setTitle("")
    setContent("")
    setSelectedColor(noteColors[0].class)
    closeCreateModal()
  }

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              rows={4}
              className="resize-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {noteColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.class)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color.class} ${
                    selectedColor === color.class
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
