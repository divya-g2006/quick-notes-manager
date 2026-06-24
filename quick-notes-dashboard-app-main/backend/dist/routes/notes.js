"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Note_1 = __importDefault(require("../models/Note"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const notes = await Note_1.default.find().sort({ order: 1, createdAt: -1 }).lean();
        res.json(notes.map((note) => ({
            id: note._id.toString(),
            title: note.title,
            content: note.content,
            category: note.category,
            color: note.color,
            order: note.order,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        })));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to fetch notes" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { title, content, category, color, isFavorite, order } = req.body;
        const note = await Note_1.default.create({
            title,
            content,
            category: category || "General",
            color: color || "bg-card",
            isFavorite: Boolean(isFavorite),
            order: order ?? 0,
        });
        res.status(201).json({
            id: note._id.toString(),
            title: note.title,
            content: note.content,
            category: note.category,
            color: note.color,
            order: note.order,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to create note" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        if (req.body.title !== undefined)
            updates.title = req.body.title;
        if (req.body.content !== undefined)
            updates.content = req.body.content;
        if (req.body.category !== undefined)
            updates.category = req.body.category;
        if (req.body.color !== undefined)
            updates.color = req.body.color;
        if (req.body.isFavorite !== undefined)
            updates.isFavorite = Boolean(req.body.isFavorite);
        if (req.body.order !== undefined)
            updates.order = Number(req.body.order);
        const note = await Note_1.default.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({
            id: note._id.toString(),
            title: note.title,
            content: note.content,
            category: note.category,
            color: note.color,
            order: note.order,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to update note" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note_1.default.findByIdAndDelete(id);
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unable to delete note" });
    }
});
exports.default = router;
