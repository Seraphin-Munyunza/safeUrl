import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// How many entries we send each time
const PAGE_SIZE = 10;

// All the routes in this file are protected by verifyToken (see app.ts),
// and every query uses the user id from the token, so users only see their own history.

// ---------- GET MY HISTORY (one page at a time) ----------
// Example: GET /api/history?page=2
router.get("/", async (req, res) => {
  try {
    const userId = res.locals.userId as number;

    let page = Number(req.query.page);
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    // We ask for one extra row. If it exists, we know there is another page.
    const rows = await prisma.urlCheck.findMany({
      where: { userId: userId },
      orderBy: [{ checkedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
    });

    const hasMore = rows.length > PAGE_SIZE;

    const checks = rows.slice(0, PAGE_SIZE).map((row) => ({
      id: row.id,
      url: row.url,
      isSafe: row.isSafe,
      status: row.status,
      threats: row.threatTypes.map((type) => ({ threatType: type })),
      checkedAt: row.checkedAt,
    }));

    res.json({ success: true, message: "History loaded.", checks: checks, hasMore: hasMore });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

// ---------- DELETE ONE ENTRY ----------
router.delete("/:id", async (req, res) => {
  try {
    const userId = res.locals.userId as number;
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, message: "The entry id is not valid." });
      return;
    }

    // The entry is only deleted if it has this id AND belongs to this user
    const result = await prisma.urlCheck.deleteMany({
      where: { id: id, userId: userId },
    });

    if (result.count === 0) {
      res.status(404).json({ success: false, message: "Entry not found." });
      return;
    }

    res.json({ success: true, message: "Entry deleted." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong on the server." });
  }
});

export default router;