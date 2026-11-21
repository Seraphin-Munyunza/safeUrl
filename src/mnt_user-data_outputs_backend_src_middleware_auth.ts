import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

// Put this before any route that needs the user to be logged in.
// It reads the token from the "Authorization: Bearer <token>" header.
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "You must log in first." });
    return;
  }

  const token = header.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Save the user id so the next function can use it
    res.locals.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Your session is not valid or has expired. Please log in again.",
    });
  }
}
