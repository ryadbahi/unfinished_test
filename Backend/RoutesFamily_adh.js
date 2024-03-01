const express = require("express");
const { format } = require("date-fns");
const db = require("./dbLink");

const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// FAMILY ______________________CREATE - POST___________________________________
router.post("/", async (req, res) => {
  const dataInput = req.body;

  try {
    // Check if dataInput is an array
    if (Array.isArray(dataInput)) {
      // If it's an array, loop through each record
      for (const data of dataInput) {
        await insertFamily(data, res);
      }
    } else {
      // If it's not an array, insert it as a single record
      await insertFamily(dataInput, res);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

async function insertFamily(data, res) {
  const { id_adherent, lien_benef, nom_benef, prenom_benef, date_nai_benef } =
    data;

  // Format the date from 'dd/MM/yyyy' to 'yyyy-MM-dd'
  const parts = date_nai_benef.split("/");
  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

  const insertQuery = `
      INSERT INTO fam_adh (
        id_adherent,
        lien_benef,
        nom_benef,
        prenom_benef,
        date_nai_benef,
      ) VALUES (?, ?, ?, ?, ?)
    `;

  try {
    await db.query(insertQuery, [
      id_adherent,
      lien_benef,
      nom_benef,
      prenom_benef,
      formattedDate, // Use the formatted date here
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}
// FAMILY____________________ READ - GET___________________________________
router.get("/", async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "id_fam",
    sortOrder = "desc",
    search = "",
    getAllData = false,
  } = req.query;

  // Validate sortBy and sortOrder here to prevent SQL injection
  const validColumns = [
    "id_fam",
    "id_adherent",
    "lien_benef",
    "nom_benef",
    "prenom_benef",
    "date_nai_benef",
    "added",
    "last_edit",
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
    SELECT a.*, s.nom_adherent, s.prenom_adherent
    FROM fam_adh a
    LEFT JOIN adherents s ON a.id_adherent = s.id_adherent
    WHERE CONCAT(
      COALESCE(a.id_fam, ''), ' ',
      COALESCE(s.nom_adherent, ''), ' ',
      COALESCE(s.prenom_adherent, ''), ' ',  -- Use s.prenom_adherent here
      COALESCE(a.lien_benef, ''), ' ',
      COALESCE(a.nom_benef, ''), ' ',
      COALESCE(a.prenom_benef, ''), ' ',
      COALESCE(a.date_nai_benef, ''), ' ',
      COALESCE(a.added, ''), ' ',
      COALESCE(a.last_edit, ''), ' '

    ) LIKE ? 
    ORDER BY ${sortBy} ${sortOrder}
    ${getAllData ? "" : "LIMIT ?, ?"}`; // Use LIMIT only if not fetching all data

  let countQuery = `
    SELECT COUNT(*) as total FROM fam_adh
    WHERE CONCAT(
      COALESCE(id_fam, ''), ' ',
      COALESCE(id_adherent, ''), ' ',
      COALESCE(lien_benef, ''), ' ',
      COALESCE(nom_benef, ''), ' ',
      COALESCE(prenom_benef, ''), ' ',
      COALESCE(date_nai_benef, ''), ' ',
      COALESCE(added, ''), ' ',
      COALESCE(last_edit, ''), ' '
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
// FAMILY __________________ GET a single record by ID_______________________
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const selectQuery = "SELECT * FROM fam_adh WHERE id_adherent = ?";

  try {
    const [result] = await db.query(selectQuery, [id]);

    if (result.length > 0) {
      result.forEach((item) => {
        item.date_nai_benef = format(
          new Date(item.date_nai_benef),
          "dd/MM/yyyy"
        );
      });
      res.status(200).json(result); // Send the entire result array
      console.log(result);
    } else {
      // Send a custom object when no record is found
      res.status(200).json([
        {
          id_fam: 0,
          id_adherent: 0,
          lien_benef: "Aucun bénéficiaire enregistré",
          nom_benef: "Aucun bénéficiaire enregistré",
          prenom_benef: "Aucun bénéficiaire enregistré",
          date_nai_benef: "",
        },
      ]);
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});
// FAMILY DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM fam_adh WHERE id_fam = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Benef deleted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});
// FAMILY ________________________ UPDATE - PUT_____________________________
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { id_adherent, lien_benef, nom_benef, prenom_benef, date_nai_benef } =
    req.body;

  const formattedDate_nai = format(new Date(date_nai_benef), "yyyy-MM-dd");

  const updateQuery =
    "UPDATE fam_adh SET id_adherent = ?, lien_benef = ?, nom_benef = ?, prenom_benef = ?, date_nai_benef = ? WHERE id_adherent = ?";

  try {
    await db.query(updateQuery, [
      id_adherent,
      lien_benef,
      nom_benef,
      prenom_benef,
      formattedDate_nai,
      id,
    ]);
    res.status(200).json({ message: "Family updated successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

module.exports = router;
