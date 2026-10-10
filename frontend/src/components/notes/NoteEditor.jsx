import "./NoteEditor.css";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createImage,
  createNote,
  deleteImage,
  getNoteById,
  updateNote,
} from "../../api/auth.api";
import { useEffect, useState } from "react";

export default function NoteEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing note when editing
  useEffect(() => {
    if (!isEditing || !accessToken) {
      return;
    }

    const fetchNote = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getNoteById(accessToken, id);
        const note = result.data.data.note;

        setFormData({
          title: note.title || "",
          content: note.content || "",
        });

        setImages(note.images || []);
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [isEditing, accessToken, id]);

  // Delete existing image
  const handleDeleteImage = async (fileId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteImage(accessToken, id, fileId);

      setImages((prevImages) =>
        prevImages.filter((image) => image.file_id !== fileId),
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image.");
    }
  };

  // Save note
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEditing) {
        // Update existing note
        await updateNote(accessToken, id, {
          title: formData.title,
          content: formData.content,
        });

        // Add new image if selected
        if (image) {
          const result = await createImage(accessToken, id, image);

          setImages((prevImages) => [...prevImages, result.data.image]);

          setImage(null);
        }
      } else {
        // Create new note
        const result = await createNote(accessToken, {
          title: formData.title,
          content: formData.content,
        });

        const noteId = result.data.note._id;

        // Add image to newly created note
        if (image) {
          await createImage(accessToken, noteId, image);
        }
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving note:", error);
      setError("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="note-editor">
        <div className="note-editor__header">
          <div>
            <h1>Loading Note...</h1>
            <p>Please wait while your note is loading.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="note-editor__header">
        <div>
          <h1>{isEditing ? "Edit Note" : "Create Note"}</h1>

          <p>
            {isEditing
              ? "Update your note."
              : "Write something you want to remember."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="note-editor__close"
        >
          ×
        </button>
      </div>

      {error && <p className="note-editor__error">{error}</p>}

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

        {/* Existing Images */}
        {isEditing && images.length > 0 && (
          <div className="note-editor__field">
            <label>Existing Images</label>

            <div className="note-editor__images">
              {images.map((img) => (
                <div key={img.file_id} className="note-editor__image-preview">
                  <img src={img.url} alt={formData.title || "Note image"} />

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.file_id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Image */}
        <div className="note-editor__field">
          <label>Images</label>

          <div className="note-editor__images">
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => {
                setImage(e.target.files[0] || null);
              }}
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
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button button--primary"
            disabled={saving}
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
