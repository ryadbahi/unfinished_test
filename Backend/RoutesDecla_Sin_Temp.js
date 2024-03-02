const express = require("express");
const db = require("./dbLink");
const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

//____________________________GET DECLARATION SIN___________________________
router.get("/", async (req, res, next) => {
  try {
    const selectQuery = `
        SELECT
        decla_sin_temp.id_sin,
          decla_sin_temp.idx,
          decla_sin_temp.id_souscript,
          souscripteurs.nom_souscript,
          decla_sin_temp.id_contrat,
          contrats.num_contrat,
          contrats.date_effet,
          contrats.date_exp,
          contrats.prime_total,
          decla_sin_temp.id_opt,
          options.num_opt,
          options.limit_plan,
          options.option_describ,
          decla_sin_temp.id_adherent,
          adherents.nom_adherent,
          adherents.prenom_adherent,
          decla_sin_temp.id_fam,
          fam_adh.lien_benef,
          fam_adh.nom_benef,
          fam_adh.prenom_benef,
          decla_sin_temp.date_sin,
          decla_sin_temp.id_nomencl,
          nomencl.code_garantie,
          nomencl.garantie_describ,
          decla_sin_temp.frais_sin,
          decla_sin_temp.rbt_sin,
          decla_sin_temp.obs_sin,
          decla_sin_temp.rib,
          decla_sin_temp.statut
        FROM decla_sin_temp
        LEFT JOIN souscripteurs ON decla_sin_temp.id_souscript = souscripteurs.id_souscript
        LEFT JOIN contrats ON decla_sin_temp.id_contrat = contrats.id_contrat
        LEFT JOIN options ON decla_sin_temp.id_opt = options.id_opt
        LEFT JOIN adherents ON decla_sin_temp.id_adherent = adherents.id_adherent
        LEFT JOIN fam_adh ON decla_sin_temp.id_fam = fam_adh.id_fam
        LEFT JOIN nomencl ON decla_sin_temp.id_nomencl = nomencl.id_nomencl
      `;

    const results = await db.query(selectQuery);

    res.status(200).json(results[0]);
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});
/*
router.get("/:id_souscript", async (req, res, next) => {
  try {
    const { id_souscript } = req.params;
    const selectQuery = `
        SELECT
        decla_sin_temp.id_sin,
          decla_sin_temp.idx,
          decla_sin_temp.id_souscript,
          souscripteurs.nom_souscript,
          decla_sin_temp.id_contrat,
          contrats.num_contrat,
          contrats.date_effet,
          contrats.date_exp,
          contrats.prime_total,
          decla_sin_temp.id_opt,
          options.num_opt,
          options.limit_plan,
          options.option_describ,
          decla_sin_temp.id_adherent,
          adherents.nom_adherent,
          adherents.prenom_adherent,
          decla_sin_temp.id_fam,
          fam_adh.lien_benef,
          fam_adh.nom_benef,
          fam_adh.prenom_benef,
          decla_sin_temp.date_sin,
          decla_sin_temp.id_nomencl,
          nomencl.code_garantie,
          nomencl.garantie_describ,
          decla_sin_temp.frais_sin,
          decla_sin_temp.rbt_sin,
          decla_sin_temp.obs_sin,
          decla_sin_temp.rib,
          decla_sin_temp.statut
        FROM decla_sin_temp
        LEFT JOIN souscripteurs ON decla_sin_temp.id_souscript = souscripteurs.id_souscript
        LEFT JOIN contrats ON decla_sin_temp.id_contrat = contrats.id_contrat
        LEFT JOIN options ON decla_sin_temp.id_opt = options.id_opt
        LEFT JOIN adherents ON decla_sin_temp.id_adherent = adherents.id_adherent
        LEFT JOIN fam_adh ON decla_sin_temp.id_fam = fam_adh.id_fam
        LEFT JOIN nomencl ON decla_sin_temp.id_nomencl = nomencl.id_nomencl
        WHERE decla_sin_temp.id_souscript = ?
      `;

    const results = await db.query(selectQuery, [id_souscript]);

    res.status(200).json(results[0]);
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});*/

router.get("/:id_contrat", async (req, res, next) => {
  try {
    const { id_contrat } = req.params;
    const selectQuery = `
        SELECT
        decla_sin_temp.id_sin,
          decla_sin_temp.idx,
          decla_sin_temp.id_souscript,
          souscripteurs.nom_souscript,
          decla_sin_temp.id_contrat,
          contrats.num_contrat,
          contrats.date_effet,
          contrats.date_exp,
          contrats.prime_total,
          decla_sin_temp.id_opt,
          options.num_opt,
          options.limit_plan,
          options.option_describ,
          decla_sin_temp.id_adherent,
          adherents.nom_adherent,
          adherents.prenom_adherent,
          decla_sin_temp.id_fam,
          fam_adh.lien_benef,
          fam_adh.nom_benef,
          fam_adh.prenom_benef,
          fam_adh.date_nai_benef,
          decla_sin_temp.date_sin,
          decla_sin_temp.id_nomencl,
          nomencl.code_garantie,
          nomencl.garantie_describ,
          decla_sin_temp.frais_sin,
          decla_sin_temp.rbt_sin,
          decla_sin_temp.obs_sin,
          decla_sin_temp.rib,
          decla_sin_temp.statut
        FROM decla_sin_temp
        LEFT JOIN souscripteurs ON decla_sin_temp.id_souscript = souscripteurs.id_souscript
        LEFT JOIN contrats ON decla_sin_temp.id_contrat = contrats.id_contrat
        LEFT JOIN options ON decla_sin_temp.id_opt = options.id_opt
        LEFT JOIN adherents ON decla_sin_temp.id_adherent = adherents.id_adherent
        LEFT JOIN fam_adh ON decla_sin_temp.id_fam = fam_adh.id_fam
        LEFT JOIN nomencl ON decla_sin_temp.id_nomencl = nomencl.id_nomencl
        WHERE decla_sin_temp.id_contrat = ?
      `;

    const results = await db.query(selectQuery, [id_contrat]);

    res.status(200).json(results[0]);
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});

module.exports = router;
