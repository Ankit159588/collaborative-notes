import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import {
  getSharedNote,
  updateSharedNote,
  deleteSharedImage,
} from "../api/share";
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
  const [socketConnected, setSocketConnected] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const socketRef = useRef(null);
  const lastSyncedRef = useRef(null);

  const canEdit = role === "editor";

  // Fetch the shared note.
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

        lastSyncedRef.current = JSON.stringify({
          title: sharedNote.title || "",
          content: sharedNote.content || "",
        });
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

  // Connect to Socket.IO for this shared note.
  useEffect(() => {
    if (!accessToken || !token || !note?._id || !role) {
      return;
    }

    const socket = io("http://localhost:3000", {
      auth: {
        accessToken,
        shareToken: token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to real-time editing");
      setSocketConnected(true);
      setError("");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
      setSocketConnected(false);
      setError("Real-time connection failed. Please refresh the page.");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Receive changes from other users.
    socket.on("note:updated", (updatedNote) => {
      const incomingTitle = updatedNote.title || "";
      const incomingContent = updatedNote.content || "";

      lastSyncedRef.current = JSON.stringify({
        title: incomingTitle,
        content: incomingContent,
      });

      setTitle(incomingTitle);
      setContent(incomingContent);

      setNote((prev) => ({
        ...prev,
        ...updatedNote,
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [accessToken, token, role, note?._id]);

  // Automatically save changes after 600 ms without typing.
  useEffect(() => {
    if (!canEdit || !socketConnected || !note) {
      return;
    }

    const changes = { title, content };
    const changesString = JSON.stringify(changes);

    // Do not resend unchanged or initially loaded content.
    if (changesString === lastSyncedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const socket = socketRef.current;

      if (!socket?.connected) {
        return;
      }

      socket.emit("note:update", changes, (result) => {
        if (!result?.success) {
          setError(result?.message || "Failed to sync changes.");
          return;
        }

        lastSyncedRef.current = JSON.stringify(result.data);

        setNote((prev) => ({
          ...prev,
          ...result.data,
        }));

        setError("");
        setSuccess("Changes synced.");
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [title, content, canEdit, socketConnected, note]);

  const handleDeleteImage = async (fileId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) return;

    try {
      await deleteSharedImage(token, accessToken, fileId);

      setNote((prev) => ({
        ...prev,
        images: prev.images.filter((image) => image.file_id !== fileId),
      }));
    } catch (error) {
      console.error("Failed to delete image:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete image. Please try again.",
      );
    }
  };

  // Keep the existing manual Save Changes button.
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

      lastSyncedRef.current = JSON.stringify({
        title: updatedNote.title || "",
        content: updatedNote.content || "",
      });

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

  return (
    <div className="shared-note">
      <div className="shared-note__header">
        <div>
          <span className="shared-note__badge">Shared Note</span>

          <p className="shared-note__role">
            Permission: <strong>{role}</strong>
          </p>

          <p className="shared-note__role">
            Live sync: {socketConnected ? "Connected" : "Connecting..."}
          </p>
        </div>

        <button
          type="button"
          className="shared-note__close"
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          &times;
        </button>
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
              <div className="shared-note__image-item" key={image.file_id}>
                <img src={image.url} alt={note.title || "Note image"} />

                {canEdit && (
                  <button
                    type="button"
                    className="shared-note__image-delete"
                    onClick={() => handleDeleteImage(image.file_id)}
                  >
                    Delete image
                  </button>
                )}
              </div>
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
