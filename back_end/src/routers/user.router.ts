import { Router } from "express";
import { prisma } from "../db";
import { createAccessToken, createRefreshToken } from "../tokens";

const router = Router();

// All the routes in this file are protected by verifyToken (see app.ts),
// so res.locals.userId is always the id of the logged in user.

// ---------- GET MY PROFILE ----------
router.get("/me", async (_req, res) => {
  try {
    const userId = res.locals.userId as number;

    // select decides which fields we send back. The password is never one of them.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, secondName: true, email: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.json({ success: true, message: "Profile loaded.", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

// ---------- UPDATE MY NAME ----------
router.patch("/me", async (req, res) => {
  try {
    const userId = res.locals.userId as number;
    const { firstName, secondName } = req.body ?? {};

    if (
      typeof firstName !== "string" ||
      typeof secondName !== "string" ||
      firstName.trim() === "" ||
      secondName.trim() === ""
    ) {
      res.status(400).json({
        success: false,
        message: "Please fill in your first name and second name.",
      });
      return;
    }

    if (firstName.trim().length > 50 || secondName.trim().length > 50) {
      res.status(400).json({
        success: false,
        message: "Each name can have at most 50 characters.",
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        secondName: secondName.trim(),
      },
      select: { id: true, firstName: true, secondName: true, email: true },
    });

    res.json({ success: true, message: "Your details were updated.", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

// ---------- CHANGE MY PASSWORD ----------
router.patch("/me/password", async (req, res) => {
  try {
    const userId = res.locals.userId as number;
    const { currentPassword, newPassword } = req.body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      currentPassword === "" ||
      newPassword === ""
    ) {
      res.status(400).json({
        success: false,
        message: "Please enter your current password and your new password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "The new password must have at least 6 characters.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      res.status(400).json({
        success: false,
        message: "The new password must be different from the current one.",
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const currentPasswordIsCorrect = await Bun.password.verify(currentPassword, user.password);

    // We use 400 here and not 401, because the front end treats 401 as "your session expired"
    if (!currentPasswordIsCorrect) {
      res.status(400).json({ success: false, message: "Your current password is wrong." });
      return;
    }

    const hashedPassword = await Bun.password.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log out every device: delete all the refresh tokens of this user
    await prisma.refreshToken.deleteMany({ where: { userId: userId } });

    // Give this device new tokens, so the user stays logged in here
    const accessToken = createAccessToken(userId);
    const refreshToken = await createRefreshToken(userId);

    res.json({
      success: true,
      message: "Password changed successfully.",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

export default router;