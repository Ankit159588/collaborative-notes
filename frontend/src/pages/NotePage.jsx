import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoteById } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { deleteNote } from "../api/auth.api";
import "./NotePage.css";

export default function NotePage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const result = await getNoteById(accessToken, id);

        setNote(result.data.data.note);
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && id) {
      fetchNote();
    }
  }, [accessToken, id]);

  if (loading) {
    return <div className="note-view__loading">Loading note...</div>;
  }

  if (!note) {
    return (
      <div className="note-view__not-found">
        <h2>Note not found</h2>

        <button
          className="button button--primary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Notes
        </button>
      </div>
    );
  }

  return (
    <div className="note-view">
      <div className="note-view__header">
        <button
          className="note-view__back"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Notes
        </button>

        <div className="note-view__menu-wrapper">
          <button
            className="note-view__menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="note-view__dropdown">
              <button>Edit</button>
              <button>Share</button>
              <button
                onClick={async (event) => {
                  event.stopPropagation();

                  const confirmed = window.confirm(
                    "Are you sure you want to delete this note?",
                  );

                  if (!confirmed) {
                    return;
                  }

                  try {
                    await deleteNote(accessToken, note._id);

                    window.location.reload();
                    navigate("/dashboard");
                  } catch (error) {
                    console.error("Error deleting note:", error);
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <article className="note-view__card">
        <div className="note-view__title-section">
          <h1>{note.title || "Untitled Note"}</h1>

          <p>
            Updated{" "}
            {new Date(note.updatedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="note-view__content">{note.content || "No content"}</div>

        {note.images?.length > 0 && (
          <div className="note-view__images">
            {note.images.map((image) => (
              <img
                key={image.file_id}
                src={image.url}
                alt={note.title || "Note image"}
              />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
