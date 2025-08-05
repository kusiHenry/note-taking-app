// public/scripts.js

const notesContainer = document.getElementById("notesContainer");
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const noteIdField = document.getElementById("noteId");

// Load notes from server
async function fetchNotes() {
  try {
    const res = await fetch("/api/notes");
    const notes = await res.json();
    renderNotes(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
  }
}

function renderNotes(notes) {
  notesContainer.innerHTML = "";
  notes.forEach(note => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    col.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${note.title}</h5>
          <p class="card-text">${note.content}</p>
          <button class="btn btn-warning btn-sm me-2" onclick="editNote('${note.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
      </div>
    `;

    notesContainer.appendChild(col);
  });
}

function editNote(id) {
  fetch(`/api/notes/${id}`)
    .then(res => res.json())
    .then(note => {
      noteIdField.value = note.id;
      noteTitle.value = note.title;
      noteContent.value = note.content;
      noteContent.focus();
    })
    .catch(err => console.error("Error loading note for edit:", err));
}

async function deleteNote(id) {
  try {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  } catch (err) {
    console.error("Error deleting note:", err);
  }
}

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = noteIdField.value;
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title || !content) return;

  const note = { title, content };

  try {
    if (id) {
      // Update
      await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note)
      });
    } else {
      // Create
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note)
      });
    }

    noteForm.reset();
    noteIdField.value = ""; //reset the id field to prevent continuous editing
    fetchNotes();
  } catch (err) {
    console.error("Error saving note:", err);
  }
});

// Initial fetch
fetchNotes();
