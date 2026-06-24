import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectToDatabase from "./db"
import notesRouter from "./routes/notes"

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send({ status: "backend running" })
})

app.use("/api/notes", notesRouter)

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error)
    process.exit(1)
  })
