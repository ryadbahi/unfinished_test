const express = require("express");
const db = require("./dbLink");
const router = express.Router();
const { format } = require("date-fns");

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// CREATE DPT SIN
router.post("/dpt_sin", async (req, res, next) => {
  const dataInput = req.body;

  try {
    if (Array.isArray(dataInput)) {
      for (const data of dataInput) {
        await insertDptSin(data);
      }
    } else {
      await insertDptSin(dataInput);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err);
  }
});

async function insertDptSin(data) {
  const {
    Assure,
    Prenom_assure,
    Beneficiaire,
    Prenom_beneficiaire,
    Date_sin,
    Categorie_Nomenclature,
    Nomenclature,
    Frais_exposes,
    Remboursement,
    Observation,
    RIB,
    Societe,
    Num_contrat,
    Ref_depot,
  } = data;

  const formattedDate_sin = format(new Date(Date_sin), "yyyy-MM-dd");

  const insertQuery = `
    INSERT INTO dpt_sin (
        Assure,
        Prenom_assure,
        Beneficiaire,
        Prenom_beneficiaire,
        Date_sin,
        Categorie_Nomenclature,
        Nomenclature,
        Frais_exposes,
        Remboursement,
        Observation,
        RIB,
        Societe,
        Num_contrat,
        Ref_depot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      Assure,
      Prenom_assure,
      Beneficiaire,
      Prenom_beneficiaire,
      formattedDate_sin,
      Categorie_Nomenclature,
      Nomenclature,
      Frais_exposes,
      Remboursement,
      Observation,
      RIB,
      Societe,
      Num_contrat,
      Ref_depot,
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

// DPT_ SIN READ - GET
router.get("/dpt_sin", (req, res, next) => {
  const selectQuery = "SELECT * FROM dpt_sin";

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error executing SELECT query:", err.message);
      res.status(500).json({ error: "Error fetching data" });
    } else {
      res.status(200).json(results);
    }
  });
});

// DPT_ SIN GET a single record by ID
router.get("/dpt_sin/:id", (req, res, next) => {
  const id = req.params.id;
  const selectSingleQuery = "SELECT * FROM dpt_sin WHERE id = ?";

  db.query(selectSingleQuery, [id], (err, results) => {
    if (err) {
      console.error("Error executing SELECT query:", err.message);
      res.status(500).json({ error: "Error fetching data" });
    } else {
      res.status(200).json(results);
    }
  });
});

// DPT_ SIN DELETE - DELETE
router.delete("/dpt_sin/:id", (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM dpt_sin WHERE id = ?";

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error executing DELETE query:", err.message);
      res.status(500).json({ error: "Error deleting data" });
    } else {
      res.status(200).json({ message: "Data deleted successfully" });
    }
  });
});

// DPT_ SIN UPDATE - PUT
router.put("/dpt_sin/:id", (req, res, next) => {
  const id = req.params.id;
  const {
    Assure,
    Prenom_assure,
    Beneficiaire,
    Prenom_beneficiaire,
    Date_sin,
    Categorie_Nomenclature,
    Nomenclature,
    Frais_exposes,
    Remboursement,
    Observation,
    RIB,
    Societe,
    Num_contrat,
    Ref_depot,
  } = req.body;

  const formattedDate_sin = format(new Date(Date_sin), "yyyy-MM-dd");

  const updateQuery = `
    UPDATE dpt_sin
    SET
      Assure = ?,
      Prenom_assure = ?,
      Beneficiaire = ?,
      Prenom_beneficiaire = ?,
      Date_sin = ?,
      Categorie_Nomenclature = ?,
      Nomenclature = ?,
      Frais_exposes = ?,
      Remboursement = ?,
      Observation = ?,
      RIB = ?,
      Societe = ?,
      Num_contrat = ?,
      Ref_depot = ?
    WHERE
      id = ?
  `;

  db.query(
    updateQuery,
    [
      Assure,
      Prenom_assure,
      Beneficiaire,
      Prenom_beneficiaire,
      formattedDate_sin,
      Categorie_Nomenclature,
      Nomenclature,
      Frais_exposes,
      Remboursement,
      Observation,
      RIB,
      Societe,
      Num_contrat,
      Ref_depot,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error executing UPDATE query:", err.message);
        res.status(500).json({ error: "Error updating data" });
      } else {
        res.status(200).json({ message: "Data updated successfully" });
      }
    }
  );
});

module.exports = router;
