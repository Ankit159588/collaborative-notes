import NoteCard from "./NoteCard";

export default function NoteGrid({ notes }) {
  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
