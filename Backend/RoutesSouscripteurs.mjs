import { Router } from "express";

import db from "./dbLink.mjs";
const router = Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// SOUSCRIPTEURS CREATE - POST
router.post("/", async (req, res, next) => {
  const dataInput = req.body;

  try {
    if (Array.isArray(dataInput)) {
      for (const data of dataInput) {
        await insertRecord(data);
      }
    } else {
      await insertRecord(dataInput);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err);
  }
});

async function insertRecord(data) {
  const {
    nom_souscript,
    adresse_souscript,
    email_souscript_1,
    email_souscript_2,
    email_souscript_3,
    tel_souscript_1,
    tel_souscript_2,
    tel_souscript_3,
    tel_souscript_4,
  } = data;

  const insertQuery = `
    INSERT INTO souscripteurs (
        nom_souscript,
        adresse_souscript,
        email_souscript_1,
        email_souscript_2,
        email_souscript_3,
        tel_souscript_1,
        tel_souscript_2,
        tel_souscript_3,
        tel_souscript_4
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      nom_souscript,
      adresse_souscript,
      email_souscript_1,
      email_souscript_2,
      email_souscript_3,
      tel_souscript_1,
      tel_souscript_2,
      tel_souscript_3,
      tel_souscript_4,
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

// SOUSCRIPTEURS READ - GET
router.get("/", async (req, res, next) => {
  const selectQuery = "SELECT * FROM souscripteurs";

  try {
    const [results] = await db.query(selectQuery);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// GET WITH SEARCH___________________________________________________

router.get("/search", async (req, res, next) => {
  const search = req.query.search || "";

  console.log(search);
  let selectQuery;

  if (search === "") {
    selectQuery = `SELECT * FROM souscripteurs 
      ORDER BY id_souscript DESC 
      LIMIT 5 `;
  } else {
    selectQuery = `SELECT * FROM souscripteurs WHERE nom_souscript LIKE ?`;
  }

  try {
    const [results] = await db.query(selectQuery, [`%${search}%`]);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// SOUSCRIPTEURS GET a single record by ID
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const selectSingleQuery =
    "SELECT * FROM souscripteurs WHERE id_souscript = ?";

  try {
    const [results] = await db.query(selectSingleQuery, [id]);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// SOUSCRIPTEURS DELETE - DELETE
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM souscripteurs WHERE id_souscript = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// SOUSCRIPTEURS UPDATE - PUT
router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const {
    nom_souscript,
    adresse_souscript,
    email_souscript_1,
    email_souscript_2,
    email_souscript_3,
    tel_souscript_1,
    tel_souscript_2,
    tel_souscript_3,
    tel_souscript_4,
  } = req.body;

  const updateQuery = `
    UPDATE souscripteurs
    SET
      nom_souscript = ?,
      adresse_souscript = ?,
      email_souscript_1 = ?,
      email_souscript_2 = ?,
      email_souscript_3 = ?,
      tel_souscript_1 = ?,
      tel_souscript_2 = ?,
      tel_souscript_3 = ?,
      tel_souscript_4 = ?
    WHERE
      id_souscript = ?
  `;

  try {
    await db.query(updateQuery, [
      nom_souscript,
      adresse_souscript,
      email_souscript_1,
      email_souscript_2,
      email_souscript_3,
      tel_souscript_1,
      tel_souscript_2,
      tel_souscript_3,
      tel_souscript_4,
      id,
    ]);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
