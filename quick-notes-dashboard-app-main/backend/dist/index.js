"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
const notes_1 = __importDefault(require("./routes/notes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send({ status: "backend running" });
});
app.use("/api/notes", notes_1.default);
(0, db_1.default)()
    .then(() => {
    app.listen(port, () => {
        console.log(`Backend listening on http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
});
