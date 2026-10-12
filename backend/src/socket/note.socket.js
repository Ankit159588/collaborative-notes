import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import noteModel from "../models/note.model.js";
import noteShareModel from "../models/noteshare.model.js";

export default function setupNoteSocket(io) {
  io.use(async (socket, next) => {
    try {
      const { accessToken, shareToken } = socket.handshake.auth;

      if (!accessToken || !shareToken) {
        return next(new Error("Access token and share token are required"));
      }

      const decoded = jwt.verify(accessToken, config.JWT_SECRET);

      if (decoded.purpose !== "ACCESS") {
        return next(new Error("Invalid access token"));
      }

      const session = await sessionModel.findOne({
        _id: decoded.session_id,
        user_id: decoded.user_id,
        revoked: false,
      });

      if (!session) {
        return next(new Error("Session is invalid"));
      }

      const share = await noteShareModel.findOne({ token: shareToken });

      if (!share) {
        return next(new Error("Share link not found"));
      }

      if (share.expires_at && share.expires_at < new Date()) {
        return next(new Error("Share link has expired"));
      }

      const note = await noteModel.findById(share.note_id);

      if (!note) {
        return next(new Error("Note not found"));
      }

      socket.data.noteId = note._id.toString();
      socket.data.shareToken = shareToken;
      socket.data.role = share.role;

      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const room = `note:${socket.data.noteId}`;

    socket.join(room);
    console.log("Connected to shared note:", socket.data.noteId);

    socket.on("note:update", async (changes, acknowledge) => {
      const reply = typeof acknowledge === "function" ? acknowledge : () => {};

      try {
        const share = await noteShareModel.findOne({
          token: socket.data.shareToken,
          note_id: socket.data.noteId,
        });

        if (!share || (share.expires_at && share.expires_at < new Date())) {
          socket.disconnect(true);
          return reply({
            success: false,
            message: "Share link is invalid or expired",
          });
        }

        if (share.role !== "editor") {
          return reply({
            success: false,
            message: "You do not have permission to edit",
          });
        }

        if (
          !changes ||
          (changes.title === undefined && changes.content === undefined) ||
          (changes.title !== undefined && typeof changes.title !== "string") ||
          (changes.content !== undefined && typeof changes.content !== "string")
        ) {
          return reply({
            success: false,
            message: "Invalid note changes",
          });
        }

        if (changes.title !== undefined && changes.title.length > 200) {
          return reply({
            success: false,
            message: "Title cannot exceed 200 characters",
          });
        }

        const note = await noteModel.findById(socket.data.noteId);

        if (!note) {
          return reply({ success: false, message: "Note not found" });
        }

        if (changes.title !== undefined) note.title = changes.title;
        if (changes.content !== undefined) note.content = changes.content;

        await note.save();

        const update = {
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
        };

        socket.broadcast.to(room).emit("note:updated", update);

        reply({ success: true, data: update });
      } catch (error) {
        console.error("Socket note update error:", error);
        reply({ success: false, message: "Failed to update note" });
      }
    });
  });
}
