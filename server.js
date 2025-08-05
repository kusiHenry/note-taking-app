const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3001;
const dbFile = path.join(__dirname, "data.json");

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Utilities
function readNotes() {
  try {
    const data = fs.readFileSync(dbFile, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeNotes(notes) {
  fs.writeFileSync(dbFile, JSON.stringify(notes, null, 2));
}

// Routes
app.get("/api/notes", (req, res) => {
  res.json(readNotes());
});

app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;
  const newNote = { id: uuidv4(), title, content };

  const notes = readNotes();
  notes.push(newNote);
  writeNotes(notes);

  res.status(201).json(newNote);
});

app.get("/api/notes/:id", (req, res) => {
  const notes = readNotes();
  const note = notes.find(n => n.id === req.params.id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ error: "Note not found" });
  }
});

app.put("/api/notes/:id", (req, res) => {
  const { title, content } = req.body;
  const notes = readNotes();
  const index = notes.findIndex(n => n.id === req.params.id);

  if (index !== -1) {
    notes[index] = { id: req.params.id, title, content };
    writeNotes(notes);
    res.json({ message: "Note updated" });
  } else {
    res.status(404).json({ error: "Note not found" });
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const notes = readNotes();
  const updated = notes.filter(note => note.id !== req.params.id);
  writeNotes(updated);
  res.json({ message: "Note deleted" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
