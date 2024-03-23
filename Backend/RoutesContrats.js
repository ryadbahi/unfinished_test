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
  const { id_souscript, num_contrat, date_effet, date_exp, prime_total } = data;

  const insertQuery = `
    INSERT INTO contrats (
        id_souscript,
        num_contrat,
        date_effet,
        date_exp,
        prime_total
        
    ) VALUES (?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      id_souscript,
      num_contrat,
      date_effet,
      date_exp,
      prime_total,
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

// CONTRATS READ - GET
router.get("/", async (req, res, next) => {
  const selectQuery = `
    SELECT contrats.*, souscripteurs.nom_souscript
    FROM contrats
    LEFT JOIN souscripteurs ON contrats.id_souscript = souscripteurs.id_souscript`;

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
  const selectSingleQuery = `
    SELECT contrats.*, souscripteurs.nom_souscript
    FROM contrats
    LEFT JOIN souscripteurs ON contrats.id_souscript = souscripteurs.id_souscript
    WHERE contrats.id_contrat = ?`;

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

// Additional route to retrieve id_opt based on id_contrat
router.get("/:id_contrat/id_opt", async (req, res, next) => {
  const id_contrat = req.params.id_contrat;
  const selectIdOptQuery = "SELECT id_opt FROM options WHERE id_contrat = ?";

  try {
    const [results] = await db.query(selectIdOptQuery, [id_contrat]);

    if (results.length === 0) {
      res.status(404).json({ error: "No matching id_opt found" });
      return;
    }

    const id_opt = results[0].id_opt;
    res.status(200).json({ id_opt });
  } catch (err) {
    next(err);
  }
});

// Route to retrieve corresponding records from fmp table based on id_opt
router.get("/:id_contrat/fmp", async (req, res, next) => {
  const id_contrat = req.params.id_contrat;

  try {
    // Retrieve id_opt based on id_contrat
    const [idOptResults] = await db.query(
      "SELECT id_opt FROM options WHERE id_contrat = ?",
      [id_contrat]
    );

    if (idOptResults.length === 0) {
      res.status(404).json({ error: "No matching id_opt found" });
      return;
    }

    const id_opt = idOptResults.id_opt;

    // Retrieve corresponding records from fmp table with details from nomencl table
    const selectFmpWithDetailsQuery = `
      SELECT fmp.*, nomencl.code_garantie, nomencl.garantie_describ
      FROM fmp
      JOIN nomencl ON fmp.id_nomencl = nomencl.id_nomencl
      WHERE fmp.id_opt = ?
    `;

    const [fmpResults] = await db.query(selectFmpWithDetailsQuery, [id_opt]);

    res.status(200).json(fmpResults);
  } catch (err) {
    next(err);
  }
});

//__________________________get optz__________________________________
router.get("/:id_contrat/opts", async (req, res, next) => {
  const id_contrat = req.params.id_contrat;

  try {
    // Retrieve id_opt and num_opt based on id_contrat
    const [optResults] = await db.query(
      "SELECT id_opt, num_opt, limit_plan FROM options WHERE id_contrat = ?",
      [id_contrat]
    );

    if (optResults.length === 0) {
      res.status(404).json({ error: "No matching records found" });
      return;
    }

    const results = optResults.map((opt) => ({
      id_opt: opt.id_opt,
      num_opt: opt.num_opt,
      limit_plan: opt.limit_plan,
    }));

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
