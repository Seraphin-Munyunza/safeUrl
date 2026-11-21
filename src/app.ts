import express from "express";
import cors from "cors";
import authRouter from "./routers/auth";
import urlRouter from "./routers/url.router";
import { verifyToken } from "./middleware/auth";

const app = express();

// Allow the React front end (Vite runs on port 5173) to talk to this server
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Safe URL Checker API is running",
  });
});

// Sign up and log in routes (anyone can use these)
app.use("/api/auth", authRouter);

// URL routes (only logged in users can use these, verifyToken checks the token first)
app.use("/api/urls", verifyToken, urlRouter);

// Not found
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error.message);

    const isTimeout =
      error.name === "TimeoutError" ||
      error.name === "AbortError";

    res.status(isTimeout ? 504 : 502).json({
      success: false,
      message: isTimeout
        ? "Google Safe Browsing request timed out"
        : "Unable to check URL at the moment",
    });
  },
);

export default app;