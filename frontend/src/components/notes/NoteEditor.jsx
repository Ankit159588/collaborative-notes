import "./NoteEditor.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createNote } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { createImage } from "../../api/auth.api";

export default function NoteEditor() {
  const [image, setImage] = useState(null);
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Create the note
      const result = await createNote(accessToken, {
        title: formData.title,
        content: formData.content,
      });

      console.log("NOTE CREATED:", result);

      // 2. Get the created note ID
      const noteId = result.data.note._id;

      // 3. Upload image if one was selected
      if (image) {
        const imageResult = await createImage(accessToken, noteId, image);

        console.log("IMAGE UPLOADED:", imageResult);
      }

      // 4. Go back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <div>
          <h1>Create Note</h1>
          <p>Write something you want to remember.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="note-editor__close"
        >
          ×
        </button>
      </div>

      <form className="note-editor__form" onSubmit={handleSubmit}>
        {/* Title */}

        <div className="note-editor__field">
          <label htmlFor="title">Title</label>

          <input
            id="title"
            type="text"
            placeholder="Enter note title"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
          />
        </div>

        {/* Content */}

        <div className="note-editor__field">
          <label htmlFor="content">Content</label>

          <textarea
            id="content"
            placeholder="Write your note here..."
            value={formData.content}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: e.target.value,
              })
            }
          />
        </div>

        {/* Images */}

        <div className="note-editor__field">
          <label>Images</label>

          <div className="note-editor__images">
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />

            <label htmlFor="image" className="note-editor__image-placeholder">
              <span>+</span>
              <p>{image ? image.name : "Add image"}</p>
            </label>
          </div>
        </div>

        {/* Buttons */}

        <div className="note-editor__actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="button button--secondary"
          >
            Cancel
          </button>

          <button type="submit" className="button button--primary">
            Save Note
          </button>
        </div>
      </form>
    </div>
  );
}
