import mongoose, { Schema, model, models } from "mongoose"

export interface INote {
  title: string
  content: string
  category: string
  color: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  order: number
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "General", trim: true },
    color: { type: String, required: true, default: "bg-card", trim: true },
    isFavorite: { type: Boolean, required: true, default: false },
    order: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
)

const Note = models.Note || model<INote>("Note", NoteSchema)

export default Note
