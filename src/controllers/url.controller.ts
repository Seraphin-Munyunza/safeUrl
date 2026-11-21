import type { Request, Response, NextFunction } from "express";
import { checkUrl } from "../services/url.service";

export const checkUrlController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid URL is required",
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS URLs are supported",
      });
    }

    const result = await checkUrl(parsedUrl.href);

    return res.status(200).json({
      success: true,
      message: "URL check completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};