import connectToDatabase from "@/lib/mongoose"
import Note from "@/models/Note"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectToDatabase()
    const notes = await Note.find().sort({ order: 1, createdAt: -1 }).lean()

    return NextResponse.json(
      notes.map((note) => ({
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        category: note.category,
        color: note.color,
        order: note.order,
        isFavorite: note.isFavorite,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      { status: 200 },
    )
  } catch (error) {
    console.error("Failed to fetch notes:", error)
    return NextResponse.json({ error: "Unable to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const createdNote = await Note.create({
      title: body.title,
      content: body.content,
      category: body.category || "General",
      color: body.color || "bg-card",
      isFavorite: Boolean(body.isFavorite),
      order: body.order ?? -Date.now(),
    })

    return NextResponse.json(
      {
        id: createdNote._id.toString(),
        title: createdNote.title,
        content: createdNote.content,
        category: createdNote.category,
        color: createdNote.color,
        order: createdNote.order,
        isFavorite: createdNote.isFavorite,
        createdAt: createdNote.createdAt,
        updatedAt: createdNote.updatedAt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create note:", error)
    return NextResponse.json({ error: "Unable to create note" }, { status: 500 })
  }
}
