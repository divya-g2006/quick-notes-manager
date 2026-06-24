import connectToDatabase from "@/lib/mongoose"
import Note from "@/models/Note"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    await connectToDatabase()

    const updateFields: any = {}

    if (body.title !== undefined) updateFields.title = body.title
    if (body.content !== undefined) updateFields.content = body.content
    if (body.category !== undefined) updateFields.category = body.category
    if (body.color !== undefined) updateFields.color = body.color
    if (body.isFavorite !== undefined) updateFields.isFavorite = Boolean(body.isFavorite)
    if (body.order !== undefined) updateFields.order = Number(body.order)

    const updatedNote = await Note.findByIdAndUpdate(params.id, updateFields, {
      new: true,
      runValidators: true,
    })

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        id: updatedNote._id.toString(),
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category,
        color: updatedNote.color,
        order: updatedNote.order,
        isFavorite: updatedNote.isFavorite,
        createdAt: updatedNote.createdAt,
        updatedAt: updatedNote.updatedAt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Failed to update note:", error)
    return NextResponse.json({ error: "Unable to update note" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const deletedNote = await Note.findByIdAndDelete(params.id)

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Failed to delete note:", error)
    return NextResponse.json({ error: "Unable to delete note" }, { status: 500 })
  }
}
