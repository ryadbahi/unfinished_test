import { Router } from "express";
import db from "./dbLink.mjs";
const router = Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

router.get("/", async (req, res, next) => {
  const selectQuary = "SELECT * FROM liens_benef";

  try {
    const [results] = await db.query(selectQuary);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
