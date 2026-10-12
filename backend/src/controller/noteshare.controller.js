import crypto from "crypto";
import noteModel from "../models/note.model.js";
import noteShareModel from "../models/noteshare.model.js";
import { deleteFromImagekit } from "../service/imagekit.service.js";

export async function createShare(req, res) {
  try {
    const { noteId } = req.params;
    const { role } = req.body;

    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invlaid share role",
        code: "INVALID_SHARE_ROLE",
        data: null,
      });
    }

    const note = await noteModel.findOne({
      _id: noteId,
      owner_id: req.user.user_id,
    });

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note not found",
        code: "NOTE_NOT_FOUND",
        data: null,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const share = await noteShareModel.create({
      note_id: note._id,
      owner_id: req.user.user_id,
      token,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Share link created successfully",
      code: "SHARE_LINK_CREATED",
      data: {
        share_id: share._id,
        token: share.token,
        role: share.role,
        share_url: `http://localhost:3001/share/${share.token}`,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create share link",
      code: "NOTES_FAILED_CREATE",
      data: null,
    });
  }
}

export async function getShareNote(req, res) {
  try {
    const { token } = req.params;

    const share = await noteShareModel.findOne({
      token,
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share link not found",
        code: "SHARE_NOT_FOUND",
        data: null,
      });
    }

    if (share.expires_at && share.expires_at < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Share link has expired",
        code: "SHARE_LINK_EXPIRED",
        data: null,
      });
    }

    const note = await noteModel.findById(share.note_id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        code: "NOTE_NOT_FOUND",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shared note fetched successfully",
      code: "SHARED_NOTE_FETCHED",
      data: {
        note,
        role: share.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shared note",
      code: "SHARED_NOTE_FETCH_FAILED",
      data: null,
    });
  }
}

export async function updateShareRole(req, res) {
  try {
    const { shareId } = req.params;
    const { role } = req.body;

    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid share role",
        code: "INVALID_SHARE_ROLE",
        data: null,
      });
    }

    const share = await noteShareModel.findOne({
      _id: shareId,
      owner_id: req.user.user_id,
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share link not found",
        code: "SHARE_NOT_FOUND",
        data: null,
      });
    }

    share.role = role;
    await share.save();

    return res.status(200).json({
      success: true,
      message: "Share role updated successfully",
      code: "SHARE_ROLE_UPDATED",
      data: {
        share_id: share._id,
        role: share.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update share role",
      code: "SHARE_ROLE_UPDATE_FAILED",
      data: null,
    });
  }
}

export async function revokeShare(req, res) {
  try {
    const { shareId } = req.params;

    const share = await noteShareModel.findOne({
      _id: shareId,
      owner_id: req.user.user_id,
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share link not found",
        code: "SHARE_NOT_FOUND",
        data: null,
      });
    }

    await noteShareModel.deleteOne({
      _id: shareId,
    });

    return res.status(200).json({
      success: true,
      message: "Share link revoked successfully",
      code: "SHARE_LINK_REVOKED",
      data: null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to revoke share link",
      code: "SHARE_REVOKE_FAILED",
      data: null,
    });
  }
}

export async function getNoteShares(req, res) {
  try {
    const { noteId } = req.params;

    const note = await noteModel.findOne({
      _id: noteId,
      owner_id: req.user.user_id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        code: "NOTE_NOT_FOUND",
        data: null,
      });
    }

    const shares = await noteShareModel
      .find({
        note_id: noteId,
        owner_id: req.user.user_id,
      })
      .select("_id token role expires_at createdAt");

    return res.status(200).json({
      success: true,
      message: "Note shares fetched successfully",
      code: "NOTE_SHARES_FETCHED",
      data: {
        shares: shares.map((share) => ({
          share_id: share._id,
          token: share.token,
          role: share.role,
          expires_at: share.expires_at,
          created_at: share.createdAt,
          share_url: `http://localhost:5173/share/${share.token}`,
        })),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch note shares",
      code: "NOTE_SHARES_FETCH_FAILED",
      data: null,
    });
  }
}

export async function updateSharedNote(req, res) {
  try {
    const { token } = req.params;
    const { title, content } = req.body;

    // Find the share link
    const share = await noteShareModel.findOne({ token });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share link not found",
        code: "SHARE_NOT_FOUND",
        data: null,
      });
    }

    // Check expiration
    if (share.expires_at && share.expires_at < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Share link has expired",
        code: "SHARE_LINK_EXPIRED",
        data: null,
      });
    }

    // Only editors can edit
    if (share.role !== "editor") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this note",
        code: "SHARE_EDIT_FORBIDDEN",
        data: null,
      });
    }

    // Validate input
    if (title === undefined && content === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a title or content to update",
        code: "NO_UPDATE_FIELDS",
        data: null,
      });
    }

    if (
      (title !== undefined && typeof title !== "string") ||
      (content !== undefined && typeof content !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and content must be strings",
        code: "INVALID_NOTE_FIELDS",
        data: null,
      });
    }

    if (title !== undefined && title.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters",
        code: "TITLE_TOO_LONG",
        data: null,
      });
    }

    // Update the original note
    const note = await noteModel.findById(share.note_id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        code: "NOTE_NOT_FOUND",
        data: null,
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    return res.status(200).json({
      success: true,
      message: "Shared note updated successfully",
      code: "SHARED_NOTE_UPDATED",
      data: {
        note,
        role: share.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shared note",
      code: "SHARED_NOTE_UPDATE_FAILED",
      data: null,
    });
  }
}

export async function deleteSharedImage(req, res) {
  try {
    const { token, file_id } = req.params;

    if (!file_id) {
      return res.status(400).json({
        success: false,
        message: "Image file ID is required",
        code: "IMAGE_FILE_ID_REQUIRED",
      });
    }

    const share = await noteShareModel.findOne({ token });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share link not found",
        code: "SHARE_NOT_FOUND",
      });
    }

    if (share.expires_at && share.expires_at < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Share link has expired",
        code: "SHARE_EXPIRED",
      });
    }

    if (share.role !== "editor") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete images",
        code: "INSUFFICIENT_PERMISSION",
      });
    }

    const note = await noteModel.findById(share.note_id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        code: "NOTE_NOT_FOUND",
      });
    }

    const imageExists = note.images.some((image) => image.file_id === file_id);

    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message: "Image not found in this note",
        code: "IMAGE_NOT_FOUND",
      });
    }

    await deleteFromImagekit(file_id);

    note.images = note.images.filter((image) => image.file_id !== file_id);

    await note.save();

    return res.status(200).json({
      success: true,
      message: "Shared note image deleted successfully",
      code: "SHARED_IMAGE_DELETED",
    });
  } catch (error) {
    console.error("DELETE SHARED IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete shared note image",
      code: "SHARED_IMAGE_DELETE_FAILED",
    });
  }
}
