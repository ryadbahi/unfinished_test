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

//___________________POST FROM ADHERENT_______________________________________________

router.post("/adherent", async (req, res, next) => {
  const { id_adherent, id_lien, nom_benef, prenom_benef, date_nai_benef } =
    req.body;
  try {
    const result = await db.query(
      "INSERT INTO fam_adh (id_adherent, id_lien, nom_benef,prenom_benef, date_nai_benef) VALUES (?, ?, ?, ? ,?)",
      [id_adherent, id_lien, nom_benef, prenom_benef, date_nai_benef]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

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
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;

  const selectQuery = `
    SELECT fa.id_fam, fa.id_adherent, fa.nom_benef, fa.prenom_benef, fa.date_nai_benef, lb.lien_benef
    FROM fam_adh fa
    INNER JOIN liens_benef lb ON fa.id_lien = lb.id_lien
    WHERE fa.id_adherent = ? AND fa.id_lien != 0`;

  try {
    const [result] = await db.query(selectQuery, [id]);

    if (result.length > 0) {
      res.status(200).json(result);
      console.log(result);
    } else {
      // Send a custom object when no record is found
      res.status(200).json([
        {
          id_fam: 0,
          id_adherent: 0,
          lien_benef: "Aucun bénéficiaire enregistré",
          nom_benef: "",
          prenom_benef: "",
          date_nai_benef: "",
        },
      ]);
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

//________________________________GET FOR DECLARATION ___________________________________________________________________________________

router.get("/:id/decla", async (req, res, next) => {
  const id = req.params.id;

  const selectQuery = `
    SELECT fa.id_fam, fa.nom_benef, fa.prenom_benef, fa.date_nai_benef, lb.lien_benef, fa.id_lien
    FROM fam_adh fa
    INNER JOIN liens_benef lb ON fa.id_lien = lb.id_lien
    WHERE fa.id_adherent = ?`;

  try {
    const [result] = await db.query(selectQuery, [id]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      // Send a custom object when no record is found
      res.status(200).json([
        {
          id_fam: 0,
          id_adherent: 0,
          lien_benef: "Aucun bénéficiaire enregistré",
          nom_benef: "",
          prenom_benef: "",
          date_nai_benef: "",
        },
      ]);
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// __________________________________________________________FAMILY DELETE_________________________________________________________________
router.delete("/:id", async (req, res, next) => {
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
  const { nom_benef, prenom_benef, date_nai_benef } = req.body;

  const updateQuery =
    "UPDATE fam_adh SET nom_benef = ?, prenom_benef = ?, date_nai_benef = ? WHERE id_fam = ?";

  try {
    await db.query(updateQuery, [nom_benef, prenom_benef, date_nai_benef, id]);
    res.status(200).json({ message: "Family updated successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

module.exports = router;
