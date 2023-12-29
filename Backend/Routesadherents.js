const express = require("express");
const { format } = require("date-fns");
const db = require("./dbLink");

const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ADHERENTS CREATE - POST
router.post("/", async (req, res) => {
  const dataInput = req.body;

  try {
    // Check if dataInput is an array
    if (Array.isArray(dataInput)) {
      // If it's an array, loop through each record
      for (const data of dataInput) {
        await insertAdherent(data, res);
      }
    } else {
      // If it's not an array, insert it as a single record
      await insertAdherent(dataInput, res);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

async function insertAdherent(data, res) {
  const {
    id_souscript,
    nom_adherent,
    prenom_adherent,
    date_nai_adh,
    situa_fam,
    rib_adh,
    email_adh,
    tel_adh,
    statut,
  } = data;

  // Format the date from 'dd/MM/yyyy' to 'yyyy-MM-dd'
  const parts = date_nai_adh.split("/");
  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

  const insertQuery = `
    INSERT INTO adherents (
      id_souscript,
      nom_adherent,
      prenom_adherent,
      date_nai_adh,
      situa_fam,
      rib_adh,
      email_adh,
      tel_adh,
      statut,
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      id_souscript,
      nom_adherent,
      prenom_adherent,
      formattedDate, // Use the formatted date here
      situa_fam,
      rib_adh,
      email_adh,
      tel_adh,
      statut,
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

// ADHERENTS READ - GET
router.get("/", async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "id_adherent",
    sortOrder = "desc",
    search = "",
    getAllData = false,
  } = req.query;

  // Validate sortBy and sortOrder here to prevent SQL injection
  const validColumns = [
    "id_adherent",
    "id_souscript",
    "nom_adherent",
    "prenom_adherent",
    "date_nai_adh",
    "situa_fam",
    "rib_adh",
    "email_adh",
    "tel_adh",
    "statut",
  ];
  if (!validColumns.includes(sortBy)) {
    return res.status(400).json({ error: "Invalid sort column" });
  }
  if (!["asc", "desc"].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({ error: "Invalid sort order" });
  }

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  let selectQuery = `
  SELECT a.*, s.nom_souscript
  FROM adherents a
  LEFT JOIN souscripteurs s ON a.id_souscript = s.id_souscript
  WHERE CONCAT(
    COALESCE(a.id_adherent, ''), ' ',
    COALESCE(s.nom_souscript, ''), ' ',  -- Use s.nom_souscript here
    COALESCE(a.nom_adherent, ''), ' ',
    COALESCE(a.prenom_adherent, ''), ' ',
    COALESCE(a.date_nai_adh, ''), ' ',
    COALESCE(a.situa_fam, ''), ' ',
    COALESCE(a.rib_adh, ''), ' ',
    COALESCE(a.email_adh, ''), ' ',
    COALESCE(a.tel_adh, ''), ' ',
    COALESCE(a.statut, '')
  ) LIKE ? 
  ORDER BY ${sortBy} ${sortOrder}
  ${getAllData ? "" : "LIMIT ?, ?"}`; // Use LIMIT only if not fetching all data

  let countQuery = `
  SELECT COUNT(*) as total FROM adherents
  WHERE CONCAT(
    COALESCE(id_adherent, ''), ' ',
    COALESCE(id_souscript, ''), ' ',
    COALESCE(nom_adherent, ''), ' ',
    COALESCE(prenom_adherent, ''), ' ',
    COALESCE(date_nai_adh, ''), ' ',
    COALESCE(situa_fam, ''), ' ',
    COALESCE(rib_adh, ''), ' ',
    COALESCE(email_adh, ''), ' ',
    COALESCE(tel_adh, ''), ' ',
    COALESCE(statut, '')
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
    console.log(results);
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// ADHERENTS GET a single record by ID
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const selectQuery = "SELECT * FROM adherents WHERE id_adherent = ?";

  try {
    const [result] = await db.query(selectQuery, [id]);

    if (result.length > 0) {
      result[0].date_nai_adh = format(
        new Date(result[0].date_nai_adh),
        "dd/MM/yyyy"
      );
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: "Adherent not found" });
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// ADHERENTS DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM adherents WHERE id_adherent = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Adherent deleted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// ADHERENTS UPDATE - PUT
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const {
    nom_adherent,
    prenom_adherent,
    date_nai_adh,
    situa_fam,
    rib_adh,
    email_adh,
    tel_adh,
    statut,
  } = req.body;

  // Format date_nai_adh
  //const parts = date_nai_adh.split("/");
  //const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  const formattedDate_nai = format(new Date(date_nai_adh), "yyyy-MM-dd");

  const updateQuery =
    "UPDATE adherents SET nom_adherent = ?, prenom_adherent = ?, date_nai_adh = ?, situa_fam = ?, rib_adh = ?, email_adh = ?, tel_adh = ?, statut = ? WHERE id_adherent = ?";

  try {
    await db.query(updateQuery, [
      nom_adherent,
      prenom_adherent,
      formattedDate_nai,
      situa_fam,
      rib_adh,
      email_adh,
      tel_adh,
      statut,
      id,
    ]);
    res.status(200).json({ message: "Adherent updated successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

module.exports = router;
