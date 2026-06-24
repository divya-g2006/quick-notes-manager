"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NoteSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: false, default: "", trim: true },
    category: { type: String, required: true, default: "General", trim: true },
    color: { type: String, required: true, default: "bg-card", trim: true },
    isFavorite: { type: Boolean, required: true, default: false },
    order: { type: Number, required: true, default: 0 },
}, { timestamps: true });
const Note = mongoose_1.models.Note || (0, mongoose_1.model)("Note", NoteSchema);
exports.default = Note;
