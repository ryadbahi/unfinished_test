const express = require("express");
const db = require("./dbLink");
const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

//______________________POST___________________________________
router.post("/", async (req, res) => {
  const dataArray = req.body;

  try {
    for (const dataInput of dataArray) {
      const tempSin = {
        id_souscript: dataInput.id_souscript,
        id_contrat: dataInput.id_contrat,
        id_opt: dataInput.id_opt,
        id_adherent: dataInput.id_adherent,
        id_fam: dataInput.id_fam,
        date_sin: dataInput.date_sin,
        id_nomencl: dataInput.id_nomencl,
        frais_sin: dataInput.frais_sin,
        rbt_sin: dataInput.rbt_sin,
        obs_sin: dataInput.obs_sin,
        rib: dataInput.rib,
        statut: dataInput.statut || "1",
      };

      let query = "INSERT INTO decla_sin_temp SET ?";
      await db.query(query, tempSin);
    }

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while inserting data" });
  }
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
          decla_sin_temp.nbr_unit,
          decla_sin_temp.statut,
          decla_sin_temp.forced
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
          decla_sin_temp.nbr_unit,
          decla_sin_temp.statut,
          decla_sin_temp.forced
        FROM decla_sin_temp
        LEFT JOIN souscripteurs ON decla_sin_temp.id_souscript = souscripteurs.id_souscript
        LEFT JOIN contrats ON decla_sin_temp.id_contrat = contrats.id_contrat
        LEFT JOIN options ON decla_sin_temp.id_opt = options.id_opt
        LEFT JOIN adherents ON decla_sin_temp.id_adherent = adherents.id_adherent
        LEFT JOIN fam_adh ON decla_sin_temp.id_fam = fam_adh.id_fam
        LEFT JOIN nomencl ON decla_sin_temp.id_nomencl = nomencl.id_nomencl
        WHERE decla_sin_temp.id_contrat = ? AND decla_sin_temp.strd = 0
      `;

    const results = await db.query(selectQuery, [id_contrat]);

    res.status(200).json(results[0]);
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});

//_____________________________GET WITH ID SIN___________________________

router.get("/:id_sin/sin"),
  async (req, res, next) => {
    try {
      const { id_sin } = req.params;
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
        decla_sin_temp.nbr_unit,
        decla_sin_temp.statut,
        decla_sin_temp.forced,
        (SELECT SUM(rbt_sin) FROM stored_sin WHERE id_adherent = decla_sin_temp.id_adherent) as conso_adh,
        fmp.id_couv_fmp,
        fmp.applied_on,
        fmp.taux_rbt,
        fmp.limit_act,
        fmp.limit_gar,
        fmp.limit_gar_describ,
        fmp.nbr_of_unit,
        fmp.unit_value
      FROM decla_sin_temp
      LEFT JOIN souscripteurs ON decla_sin_temp.id_souscript = souscripteurs.id_souscript
      LEFT JOIN contrats ON decla_sin_temp.id_contrat = contrats.id_contrat
      LEFT JOIN options ON decla_sin_temp.id_opt = options.id_opt
      LEFT JOIN adherents ON decla_sin_temp.id_adherent = adherents.id_adherent
      LEFT JOIN fam_adh ON decla_sin_temp.id_fam = fam_adh.id_fam
      LEFT JOIN nomencl ON decla_sin_temp.id_nomencl = nomencl.id_nomencl
      LEFT JOIN fmp ON decla_sin_temp.id_opt = fmp.id_opt AND decla_sin_temp.id_nomencl = fmp.id_nomencl
      WHERE decla_sin_temp.id_sin = ? AND decla_sin_temp.strd = 0
    `;
      const results = await db.query(selectQuery, [id_sin]);
      const data = results[0];

      console.log("Retrieved data:", data);

      if (!data || data.length === 0) {
        console.log("No data found");
        return { result: 0, statement: "No data found" };
      }

      const {
        frais_sin,
        rbt_sin,
        statut,
        forced,
        limit_plan,
        applied_on,
        taux_rbt,
        limit_act,
        limit_gar,
        unit_value,
        date_sin,
        id_adherent,
        id_fam,
      } = data;

      // Step 1: Check if frais_sin is not null, undefined, or equal to 0
      console.log("Checking frais_sin:", frais_sin);
      if (frais_sin === null || frais_sin === undefined || frais_sin === 0) {
        console.log("frais_sin is null, undefined, or 0");
        return { result: 0, statement: "frais_sin is null, undefined, or 0" };
      }

      // Step 2: Check if forced is 1
      console.log("Checking forced:", forced);
      if (forced === 1) {
        console.log("forced = 1");
        return { result: rbt_sin, statement: "forced = 1" };
      }

      // Step 3: Check if conso_adh is >= limit_plan
      console.log("Checking conso_adh:", conso_adh);
      console.log("Checking limit_plan:", limit_plan);
      if (conso_adh >= limit_plan) {
        console.log("Limite du plan atteinte");
        return { result: 0, statement: "Limite du plan atteinte" };
      }

      // Step 4: Check if date_sin is inside date_effet and date_exp
      console.log("Checking date_sin:", date_sin);
      console.log("Checking date_effet:", date_effet);
      console.log("Checking date_exp:", date_exp);
      if (date_sin < date_effet || date_sin > date_exp) {
        console.log("Date de sinistre hors couverture");
        return { result: 0, statement: "Date de sinistre hors couverture" };
      }

      // Step 5: Check the stat of lien_benef
      // Calculate age difference between date_nai_benef and date_sin
      const dateOfBirth = new Date(date_nai_benef);
      const currentDate = new Date(date_sin);

      console.log("Date of birth:", dateOfBirth);
      console.log("Current date:", currentDate);

      // Calculate the difference in milliseconds
      const ageDifferenceMs = currentDate - dateOfBirth;

      // Convert milliseconds to years
      const ageDate = new Date(ageDifferenceMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      console.log("Calculated age:", age);

      // Check if the lien_benef contains "enfant"
      const isEnfant = lien_benef.toLowerCase().includes("enfant");

      if (isEnfant && age >= 21) {
        console.log("Enfant 21 ou plus");
        return { result: 0, statement: "Enfant 21 ou plus" };
      }

      // Senario 1: applied_on is "Par acte"
      if (applied_on.toLowerCase() === "par acte") {
        const result1 = frais_sin * (taux_rbt / 100);
        console.log("Senario 1 result:", result1);
        return { result: Math.min(result1, limit_act), statement: "Senario 1" };
      }

      // Senario 2: applied_on is "Par adherent"
      if (applied_on.toLowerCase() === "par adherent") {
        // Calculate amount1
        const amount1 = Math.min(
          frais_sin * (taux_rbt / 100),
          limit_act,
          unit_value
        );

        console.log("Senario 2 amount1:", amount1);

        // Calculate amount2 by looping through decla_sin_temp
        let amount2 = 0;
        for (const entry of decla_sin_temp) {
          if (
            entry.id_adherent === id_adherent &&
            entry.id_nomencl === id_nomencl &&
            entry.strd === 0
          ) {
            amount2 += entry.rbt_sin || 0;
          }
        }

        console.log("Senario 2 amount2:", amount2);

        // Calculate amount3 by looping through stored_sin
        let amount3 = 0;
        for (const entry of stored_sin) {
          if (
            entry.id_adherent === id_adherent &&
            entry.id_nomencl === id_nomencl
          ) {
            amount3 += entry.rbt_sin || 0;
          }
        }

        console.log("Senario 2 amount3:", amount3);

        // Check if total exceeds limit_gar
        if (amount1 + amount2 + amount3 > limit_gar) {
          console.log("Limite de garantie atteinte");
          return { result: 0, statement: "Limite de garantie atteinte" };
        }

        return { result: Math.min(amount1, limit_act), statement: "Senario 2" };
      }

      // Senario 3: applied_on is "Par bénéficiaire"
      if (applied_on.toLowerCase() === "par bénéficiaire") {
        // Calculate amount1
        const amount1 = Math.min(
          frais_sin * (taux_rbt / 100),
          limit_act,
          unit_value
        );

        console.log("Senario 3 amount1:", amount1);

        // Calculate amount2 by looping through decla_sin_temp
        let amount2 = 0;
        for (const entry of decla_sin_temp) {
          if (
            entry.id_fam === id_fam &&
            entry.id_nomencl === id_nomencl &&
            entry.strd === 0
          ) {
            amount2 += entry.rbt_sin || 0;
          }
        }

        console.log("Senario 3 amount2:", amount2);

        // Calculate amount3 by looping through stored_sin
        let amount3 = 0;
        for (const entry of stored_sin) {
          if (entry.id_fam === id_fam && entry.id_nomencl === id_nomencl) {
            amount3 += entry.rbt_sin || 0;
          }
        }

        console.log("Senario 3 amount3:", amount3);

        // Check if total exceeds limit_gar
        if (amount1 + amount2 + amount3 > limit_gar) {
          console.log("Limite de garantie atteinte");
          return { result: 0, statement: "Limite de garantie atteinte" };
        }

        return { result: Math.min(amount1, limit_act), statement: "Senario 3" };
      }
      console.log("Result:", result);
      console.log("Statement:", statement);

      // Send a response back to the client
      res
        .status(200)
        .json({ message: "Result logged to the server's console" });
      console.log("Unknown scenario");
      return { result: 0, statement: "Unknown scenario" };
    } catch (error) {
      console.log("Error occurred:", error.message);
      return { result: 0, statement: "Error occurred: " + error.message };
    }
  };

///_________________________PUT ONLY ON STRD COLUMN_______________________

router.put("/", async (req, res) => {
  const id_sins = req.body.id_sins;
  const strd = req.body.strd;

  const updateQuery = "UPDATE decla_sin_temp SET strd = ? WHERE id_sin = ?";

  try {
    for (let id_sin of id_sins) {
      await db.query(updateQuery, [strd, id_sin]);
    }
    res.status(200).json({ message: `Declarations saved!` });
  } catch (err) {
    // Handle error scenario
    console.error(`Error updating declarations:`, err);
    res.status(500).json({ error: "Internal Server Error" });
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

module.exports = router;
