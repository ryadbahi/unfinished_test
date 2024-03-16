const express = require("express");
const db = require("./dbLink");
const router = express.Router();
const { format } = require("date-fns");

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

//_______________POST____________________

router.post("/", async (req, res, next) => {
  const dataInput = req.body;

  try {
    if (Array.isArray(dataInput)) {
      for (const data of dataInput) {
        await insertStoredSin(data);
      }
    } else {
      dataInput.ref_dpt = refDpt; // Add ref_dpt to the object
      await insertStoredSin(dataInput);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err);
  }
});

async function insertStoredSin(data) {
  const {
    idx,
    id_souscript,
    nom_souscript,
    id_contrat,
    id_opt,
    num_opt,
    id_adherent,
    nom_adherent,
    prenom_adherent,
    id_fam,
    lien_benef,
    prenom_benef,
    date_sin,
    id_nomencl,
    frais_sin,
    rbt_sin,
    nbr_unit,
    obs_sin,
    statut,
    forced,
    rib,
    ref_dpt,
  } = data;

  const formattedDate_sin = format(new Date(date_sin), "yyyy-MM-dd");

  const insertQuery = `
        INSERT INTO stored_sin (
            idx,
            id_souscript,
            nom_souscript,
            id_contrat,
            id_opt,
            num_opt,
            id_adherent,
            nom_adherent,
            prenom_adherent,
            id_fam,
            lien_benef,
            prenom_benef,
            date_sin,
            id_nomencl,
            frais_sin,
            rbt_sin,
            nbr_unit,
            obs_sin,
            statut,
            forced,
            rib,
            ref_dpt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

  try {
    await db.query(insertQuery, [
      idx,
      id_souscript,
      nom_souscript,
      id_contrat,
      id_opt,
      num_opt,
      id_adherent,
      nom_adherent,
      prenom_adherent,
      id_fam,
      lien_benef,
      prenom_benef,
      formattedDate_sin,
      id_nomencl,
      frais_sin,
      rbt_sin,
      nbr_unit,
      obs_sin,
      statut,
      forced,
      rib,
      ref_dpt,
    ]);

    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

router.get("/", async (req, res) => {
  const selectQuery = "SELECT * FROM stored_sin";

  try {
    const [results] = await db.query(selectQuery);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing SELECT query:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;
