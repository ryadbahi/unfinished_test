import { Router } from "express";
import db from "./dbLink.mjs";

const router = Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

//______________________________POST____________________________________

router.post("/", async (req, res, next) => {
  const { full_souscr, abbrev_souscr } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO abbrev_sous (full_souscr, abbrev_souscr) VALUES (?, ?)",
      [full_souscr, abbrev_souscr]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

//_______________________________GET___________________________________

router.get("/", async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "id_abbrev",
    sortOrder = "desc",
    search = "",
    getAllData = false,
  } = req.query;

  // Validate sortBy and sortOrder here to prevent SQL injection
  const validColumns = ["id_abbrev", "full_souscr", "abbrev_souscr"];
  if (!validColumns.includes(sortBy)) {
    return res.status(400).json({ error: "Invalid sort column" });
  }
  if (!["asc", "desc"].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({ error: "Invalid sort order" });
  }

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  let selectQuery = `
    SELECT * FROM abbrev_sous
    WHERE CONCAT(
      COALESCE(id_abbrev, ''), ' ',
      COALESCE(full_souscr, ''), ' ',
      COALESCE(abbrev_souscr, '')
    ) LIKE ? 
    ORDER BY ${sortBy} ${sortOrder}
    ${getAllData ? "" : "LIMIT ?, ?"}`; // Use LIMIT only if not fetching all data

  let countQuery = `
    SELECT COUNT(*) as total FROM abbrev_sous
    WHERE CONCAT(
      COALESCE(id_abbrev, ''), ' ',
      COALESCE(full_souscr, ''), ' ',
      COALESCE(abbrev_souscr, '')
    ) LIKE ?`;

  try {
    const [results] = await db.query(selectQuery, [
      `%${search}%`,
      offset,
      limit,
    ]);
    const [totalResult] = await db.query(countQuery, [`%${search}%`]);
    const total = totalResult[0].total;
    res.status(200).json({
      data: results,
      total: total,
    });
  } catch (err) {
    next(err);
  }
});

//______________________________PUT____________________________________

router.put("/:id", async (req, res, next) => {
  const { full_souscr, abbrev_souscr } = req.body;
  try {
    const result = await db.query(
      "UPDATE abbrev_sous SET full_souscr = ?, abbrev_souscr = ? WHERE id_abbrev = ?",
      [full_souscr, abbrev_souscr, req.params.id]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

//_______________________________DELETE___________________________________

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM abbrev_sous WHERE id_abbrev = ?",
      [req.params.id]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
