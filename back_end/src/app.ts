import express from "express";
import cors from "cors";
import authRouter from "./routers/auth";
import urlRouter from "./routers/url.router";
import userRouter from "./routers/user.router";
import historyRouter from "./routers/history.router";
import { verifyToken } from "./middleware/auth";

const app = express();

// The address of the React front end.
// On your computer it is Vite's address. After deployment, set FRONTEND_URL on Render
// to your Netlify address (without a "/" at the end).
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));

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

// Profile routes (only logged in users can use these)
app.use("/api/users", verifyToken, userRouter);

// History routes (only logged in users can use these)
app.use("/api/history", verifyToken, historyRouter);

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