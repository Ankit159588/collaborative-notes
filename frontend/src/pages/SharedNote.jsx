import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSharedNote, updateSharedNote } from "../api/share";
import { useAuth } from "../context/AuthContext";
import "../pages/ShareNote.css";

export default function SharedNote() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [note, setNote] = useState(null);
  const [role, setRole] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchSharedNote() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);

        const result = await getSharedNote(token);
        const sharedNote = result.data.data.note;

        setNote(sharedNote);
        setRole(result.data.data.role);
        setTitle(sharedNote.title || "");
        setContent(sharedNote.content || "");
      } catch (error) {
        console.error("Failed to fetch shared note:", error);

        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedNote();
  }, [token, accessToken, navigate]);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await updateSharedNote(token, accessToken, {
        title,
        content,
      });

      const updatedNote = result.data.data.note;

      setNote(updatedNote);
      setTitle(updatedNote.title || "");
      setContent(updatedNote.content || "");
      setSuccess("Note saved successfully.");
    } catch (error) {
      console.error("Failed to update shared note:", error);

      if (error.response?.status === 403) {
        setError("You do not have permission to edit this note.");
      } else if (error.response?.status === 410) {
        setError("This share link has expired.");
      } else if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(error.response?.data?.message || "Failed to save the note.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="shared-note__loading">Loading shared note...</div>;
  }

  if (!accessToken) {
    return (
      <div className="shared-note__not-found">
        <h2>Login required</h2>
        <p>You need to log in to view this shared note.</p>

        <button
          className="shared-note__login-button"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="shared-note__not-found">
        <h2>Note not found</h2>
        <p>This share link may be invalid or expired.</p>

        <button
          className="shared-note__login-button"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const canEdit = role === "editor";

  return (
    <div className="shared-note">
      <div className="shared-note__header">
        <div>
          <span className="shared-note__badge">Shared Note</span>

          <p className="shared-note__role">
            Permission: <strong>{role}</strong>
          </p>
        </div>
      </div>

      <article className="shared-note__card">
        <div className="shared-note__title-section">
          {canEdit ? (
            <input
              type="text"
              value={title}
              maxLength={200}
              placeholder="Untitled Note"
              onChange={(event) => {
                setTitle(event.target.value);
                setSuccess("");
              }}
              aria-label="Note title"
            />
          ) : (
            <h1>{note.title || "Untitled Note"}</h1>
          )}

          {note.updatedAt && (
            <p>
              Updated{" "}
              {new Date(note.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="shared-note__content">
          {canEdit ? (
            <textarea
              value={content}
              placeholder="Write your note..."
              onChange={(event) => {
                setContent(event.target.value);
                setSuccess("");
              }}
              aria-label="Note content"
              rows={12}
            />
          ) : (
            <div>{note.content || "No content"}</div>
          )}
        </div>

        {note.images?.length > 0 && (
          <div className="shared-note__images">
            {note.images.map((image) => (
              <img
                key={image.file_id}
                src={image.url}
                alt={note.title || "Note image"}
              />
            ))}
          </div>
        )}

        {canEdit && (
          <div className="shared-note__actions">
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
      </article>
    </div>
  );
}
