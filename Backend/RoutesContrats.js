const express = require("express");
const { format } = require("date-fns");
const db = require("./dbLink");
const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// CONTRATS CREATE - POST
router.post("/", async (req, res, next) => {
  const dataInput = req.body;

  try {
    if (Array.isArray(dataInput)) {
      for (const data of dataInput) {
        await insertContrat(data);
      }
    } else {
      await insertContrat(dataInput);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err);
  }
});

async function insertContrat(data) {
  const {
    id_souscript,
    num_contrat,
    date_effet,
    date_exp,
    prime_total,
    Duree_contr,
  } = data;

  const formattedDate_effet = format(new Date(date_effet), "yyyy-MM-dd");
  const formattedDate_exp = format(new Date(date_exp), "yyyy-MM-dd");

  const insertQuery = `
    INSERT INTO contrats (
        id_souscript,
        num_contrat,
        date_effet,
        date_exp,
        prime_total,
        Duree_contr
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      id_souscript,
      num_contrat,
      formattedDate_effet,
      formattedDate_exp,
      prime_total,
      Duree_contr,
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

// CONTRATS READ - GET
router.get("/", async (req, res, next) => {
  const selectQuery = "SELECT * FROM contrats";

  try {
    const [results] = await db.query(selectQuery);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// CONTRATS GET a single record by ID
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const selectSingleQuery = "SELECT * FROM contrats WHERE id_contrat = ?";

  try {
    const [results] = await db.query(selectSingleQuery, [id]);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// CONTRATS DELETE - DELETE
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM contrats WHERE id_contrat = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// CONTRATS UPDATE - PUT
router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const {
    id_souscript,
    num_contrat,
    date_effet,
    date_exp,
    prime_total,
    Duree_contr,
  } = req.body;

  const formattedDate_effet = format(new Date(date_effet), "yyyy-MM-dd");
  const formattedDate_exp = format(new Date(date_exp), "yyyy-MM-dd");
  const updateQuery = `
    UPDATE contrats
    SET
      id_souscript = ?,
      num_contrat = ?,
      date_effet = ?,
      date_exp = ?,
      prime_total = ?,
      Duree_contr = ?
    WHERE
      id_contrat = ?
  `;

  try {
    await db.query(updateQuery, [
      id_souscript,
      num_contrat,
      formattedDate_effet,
      formattedDate_exp,
      prime_total,
      Duree_contr,
      id,
    ]);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
