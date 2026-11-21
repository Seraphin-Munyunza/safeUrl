import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { JWT_REFRESH_SECRET } from "../config";
import {
  createAccessToken,
  createRefreshToken,
  deleteRefreshToken,
} from "../tokens";

const router = Router();

// ---------- SIGN UP ----------
router.post("/signup", async (req, res) => {
  try {
    const { firstName, secondName, email, password } = req.body ?? {};

    // All four values must exist and be text
    if (
      typeof firstName !== "string" ||
      typeof secondName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      firstName.trim() === "" ||
      secondName.trim() === "" ||
      email.trim() === "" ||
      password === ""
    ) {
      res.status(400).json({ success: false, message: "Please fill in all the fields." });
      return;
    }

    // Make the email small letters so "A@x.com" and "a@x.com" are the same
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@")) {
      res.status(400).json({ success: false, message: "Please enter a valid email address." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "The password must have at least 6 characters.",
      });
      return;
    }

    // Check if this email is already used
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: "Email already in use." });
      return;
    }

    // Never save the real password, save the hashed one
    const hashedPassword = await Bun.password.hash(password);

    await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        secondName: secondName.trim(),
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    res.status(201).json({ success: true, message: "Account created successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

// ---------- LOG IN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim() === "" ||
      password === ""
    ) {
      res.status(400).json({ success: false, message: "Please enter your email and password." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Same message for a wrong email and a wrong password, so nobody can guess which emails exist
    if (!user) {
      res.status(401).json({ success: false, message: "Wrong email or password." });
      return;
    }

    const passwordIsCorrect = await Bun.password.verify(password, user.password);

    if (!passwordIsCorrect) {
      res.status(401).json({ success: false, message: "Wrong email or password." });
      return;
    }

    // Create both tokens
    const accessToken = createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    res.json({
      success: true,
      message: "Logged in successfully.",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

// ---------- REFRESH ----------
// The front end sends the refresh token here when the access token has expired
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};

    if (typeof refreshToken !== "string" || refreshToken === "") {
      res.status(400).json({ success: false, message: "The refresh token is missing." });
      return;
    }

    // Step 1: check the signature and the expiry date of the token
    let userId = 0;

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch {
      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
      return;
    }

    // Step 2: the token must be in the database. We delete it, because it can only be used once.
    const tokenWasFound = await deleteRefreshToken(refreshToken);

    if (!tokenWasFound) {
      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
      return;
    }

    // Step 3: give the user a new access token and a new refresh token
    const newAccessToken = createAccessToken(userId);
    const newRefreshToken = await createRefreshToken(userId);

    res.json({
      success: true,
      message: "Token refreshed.",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

// ---------- LOG OUT ----------
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};

    // Delete the refresh token so it can never be used again
    if (typeof refreshToken === "string" && refreshToken !== "") {
      await deleteRefreshToken(refreshToken);
    }

    res.json({ success: true, message: "Logged out." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

export default router;