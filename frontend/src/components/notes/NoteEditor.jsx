import "./NoteEditor.css";
export default function NoteEditor() {
  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <div>
          <h1>Create Note</h1>
          <p>Write something you want to remember.</p>
        </div>

        <button className="note-editor__close">×</button>
      </div>

      <div className="note-editor__form">
        {/* Title */}

        <div className="note-editor__field">
          <label htmlFor="title">Title</label>

          <input id="title" type="text" placeholder="Enter note title" />
        </div>

        {/* Content */}

        <div className="note-editor__field">
          <label htmlFor="content">Content</label>

          <textarea id="content" placeholder="Write your note here..." />
        </div>

        {/* Images */}

        <div className="note-editor__field">
          <label>Images</label>

          <div className="note-editor__images">
            <div className="note-editor__image-placeholder">
              <span>+</span>
              <p>Add image</p>
            </div>
          </div>
        </div>

        {/* Buttons */}

        <div className="note-editor__actions">
          <button className="button button--secondary">Cancel</button>

          <button className="button button--primary">Save Note</button>
        </div>
      </div>
    </div>
  );
}
