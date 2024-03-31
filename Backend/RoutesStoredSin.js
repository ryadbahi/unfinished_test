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
    res_calcul,
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
            res_calcul,
            forced,
            rib,
            ref_dpt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      res_calcul,
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

//__________________________________GET__________________________________________________

router.get("/:id_contrat/stored/accepted", async (req, res) => {
  try {
    const { id_contrat } = req.params;
    const {
      page = page || 1,
      pageSize = pageSize || 10,
      search = "",
    } = req.query;

    const offset = (page - 1) * pageSize;

    const selectQuery = `
      SELECT
        stored_sin.id_strd_sin,
        stored_sin.idx,
        stored_sin.id_opt,
        stored_sin.num_opt,
        stored_sin.id_adherent,
        stored_sin.nom_adherent,
        stored_sin.prenom_adherent,
        stored_sin.lien_benef,
        stored_sin.id_fam,
        stored_sin.prenom_benef,
        stored_sin.date_sin,
        stored_sin.id_nomencl,
        nomencl.code_garantie,
        nomencl.garantie_describ,
        stored_sin.frais_sin,
        stored_sin.rbt_sin,
        stored_sin.res_calcul,
        stored_sin.nbr_unit,
        stored_sin.obs_sin,
        stored_sin.forced,
        stored_sin.rib,
        stored_sin.ref_dpt
      FROM stored_sin 
      LEFT JOIN nomencl ON stored_sin.id_nomencl = nomencl.id_nomencl
      WHERE stored_sin.id_contrat = ? AND rbt_sin != 0 AND (stored_sin.nom_adherent LIKE ? OR stored_sin.prenom_adherent LIKE ?)
      ORDER BY stored_sin.id_strd_sin DESC
      LIMIT ? OFFSET ?
    `;

    const results = await db.query(selectQuery, [
      id_contrat,
      `%${search}%`,
      `%${search}%`,
      parseInt(pageSize),
      offset,
    ]);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/:id_contrat/stored/rejected", async (req, res) => {
  try {
    const { id_contrat } = req.params;
    const { page = 1, pageSize = 10, search = "" } = req.query;

    const offset = (page - 1) * pageSize;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM stored_sin 
      WHERE stored_sin.id_contrat = ? AND rbt_sin = 0 AND (stored_sin.nom_adherent LIKE ? OR stored_sin.prenom_adherent LIKE ?)
    `;

    const selectQuery = `
      SELECT
        stored_sin.id_strd_sin,
        stored_sin.idx,
        stored_sin.id_opt,
        stored_sin.num_opt,
        stored_sin.id_adherent,
        stored_sin.nom_adherent,
        stored_sin.prenom_adherent,
        stored_sin.lien_benef,
        stored_sin.id_fam,
        stored_sin.prenom_benef,
        stored_sin.date_sin,
        stored_sin.id_nomencl,
        nomencl.code_garantie,
        nomencl.garantie_describ,
        stored_sin.frais_sin,
        stored_sin.rbt_sin,
        stored_sin.res_calcul,
        stored_sin.nbr_unit,
        stored_sin.obs_sin,
        stored_sin.forced,
        stored_sin.rib,
        stored_sin.ref_dpt
      FROM stored_sin 
      LEFT JOIN nomencl ON stored_sin.id_nomencl = nomencl.id_nomencl
      WHERE stored_sin.id_contrat = ? AND rbt_sin = 0 AND (stored_sin.nom_adherent LIKE ? OR stored_sin.prenom_adherent LIKE ?)
      ORDER BY stored_sin.id_strd_sin DESC
      LIMIT ? OFFSET ?
    `;

    const [totalResults] = await db.query(countQuery, [
      id_contrat,
      `%${search}%`,
      `%${search}%`,
    ]);

    const results = await db.query(selectQuery, [
      id_contrat,
      `%${search}%`,
      `%${search}%`,
      parseInt(pageSize),
      offset,
    ]);

    res.status(200).json({
      data: results[0],
      histoRejectedLength: totalResults[0].total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
