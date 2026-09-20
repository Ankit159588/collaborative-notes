import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        code: "ACCESS_TOKEN_REQUIRED",
        data: null,
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header",
        code: "INVALID_AUTHORIZATION_HEADER",
        data: null,
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Access token is invalid or expired",
        code: "ACCESS_TOKEN_INVALID_OR_EXPIRED",
        data: null,
      });
    }

    if (decoded.purpose !== "ACCESS") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        code: "INVALID_ACCESS_TOKEN",
        data: null,
      });
    }

    req.user = {
      user_id: decoded.user_id,
      session_id: decoded.session_id,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      data: null,
    });
  }
}
