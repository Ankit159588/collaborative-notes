export default function NoteCard({ note }) {
  return (
    <div className="note-card">
      <div className="note-card__header">
        <h2>{note.title}</h2>

        <button
          className="note-card__menu"
          onClick={(event) => event.stopPropagation()}
        >
          ⋮
        </button>
      </div>

      <p className="note-card__content">{note.content}</p>

      <div className="note-card__footer">
        <span>Updated {note.updated}</span>

        <span className="note-card__arrow">→</span>
      </div>
    </div>
  );
}
