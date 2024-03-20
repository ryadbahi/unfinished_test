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
        ORDER BY decla_sin_temp.date_sin DESC`;

    const results = await db.query(selectQuery, [id_contrat]);

    res.status(200).json(results[0]);
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});

//_____________________________GET WITH ID SIN___________________________

router.get("/:id_sin/sin", async (req, res, next) => {
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
    console.log(id_sin);
    //______________________________________________________________________1er bloc de conditions_______________________________________________
    if (results.length === 0) {
      // If no results found, throw an error
      throw new Error("No data found for the given id_sin.");
    }

    const responseData = results[0];
    const data = responseData[0];
    const fraisSin = data.frais_sin || 0;
    const consoAdh = data.conso_adh || 0;

    // Step 1: Check if frais_sin is not null, undefined, or 0
    if (fraisSin === 0) {
      throw new Error("Frais exposé sont à 0");
    }

    let resultStatusArray = [];
    console.log(data.limit_plan);
    console.log(consoAdh);
    const dateSin = new Date(data.date_sin);
    const dateEffet = new Date(data.date_effet);
    const dateExp = new Date(data.date_exp);

    if (dateSin < dateEffet || dateSin > dateExp) {
      resultStatusArray.push({
        result: 0,
        status: "Date de sinistre hors couverture",
      });
    } else {
      // Check if lien_benef contains "enfant" (case-insensitive)
      const lienBenef = data.lien_benef.toLowerCase();
      if (lienBenef.includes("enfant")) {
        // Calculate age between date_nai_benef and date_sin
        const dateNaissanceBenef = new Date(data.date_nai_benef);
        const twentyFirstBirthday = new Date(dateNaissanceBenef.getTime());
        twentyFirstBirthday.setFullYear(dateNaissanceBenef.getFullYear() + 21);
        const timeDiff = twentyFirstBirthday.getTime() - dateSin.getTime();
        const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (remainingDays <= 0) {
          resultStatusArray.push({
            result: 0,
            status: "Enfant 21 ans ou plus",
          });
        } else {
          // If forced is 1, return the actual result and stop there
          if (data.forced === 1) {
            resultStatusArray.push({
              result: fraisSin,
              status: "OK",
            });
          } else {
            // Check if conso_adh is greater than or equal to limit_plan
            if (consoAdh >= data.limit_plan) {
              resultStatusArray.push({
                result: 0,
                status: "Limite du plan atteinte",
              });
            } else {
              // If conso_adh is less than limit_plan, return the actual result
              resultStatusArray.push({
                result: fraisSin,
                status: "OK",
              });
            }
          }
        }
      } else {
        // If lien_benef does not contain "enfant", proceed with existing logic
        if (data.forced === 1) {
          resultStatusArray.push({
            result: fraisSin,
            status: "OK",
          });
        } else {
          if (consoAdh >= data.limit_plan) {
            resultStatusArray.push({
              result: 0,
              status: "Limite du plan atteinte",
            });
          } else {
            resultStatusArray.push({
              result: fraisSin,
              status: "OK",
            });
          }
        }
      }
    }
    //_____________________________________________________________fin du 1er bloc de conditions_____________________________________________

    let finalResult = [];
    let stp2Result = resultStatusArray[0].result;
    let stp2status = resultStatusArray[0].status;
    console.log(stp2status);

    if (stp2status === "OK") {
      if (data.applied_on === "Acte") {
        const rbtResult = stp2Result * (data.taux_rbt / 100);
        const result = Math.min(rbtResult, data.limit_act);

        finalResult.push({
          result: result,
          status: "OK",
        });
      } else if (data.applied_on === "Assuré") {
        console.log(data.applied_on);

        const querySinTemp =
          "SELECT SUM(rbt_sin) AS total_rbt_sin_temp FROM decla_sin_temp WHERE id_souscript = ? AND id_adherent = ? AND id_nomencl = ? AND strd = 0";
        const sinTempValues = [
          data.id_souscript,
          data.id_adherent,
          data.id_nomencl,
        ];

        const sinTempRows = await db.query(querySinTemp, sinTempValues);
        const totalRbtSinInSinTemp = sinTempRows[0][0].total_rbt_sin_temp || 0;

        const queryStrdSin =
          "SELECT SUM(rbt_sin) AS total_rbt_sin_strd FROM stored_sin WHERE id_souscript = ? AND id_adherent = ? AND id_nomencl = ?";
        const strdSinValues = [
          data.id_souscript,
          data.id_adherent,
          data.id_nomencl,
        ];
        const strdSinrows = await db.query(queryStrdSin, strdSinValues);
        const totalRbtSinInStrdSin = strdSinrows[0][0].total_rbt_sin_strd || 0;
        console.log(strdSinrows);

        console.log("resultat 1", totalRbtSinInSinTemp);
        console.log("resultat 2", totalRbtSinInStrdSin);

        let totalRbtSin = totalRbtSinInSinTemp + totalRbtSinInStrdSin;

        calculatedRbt = Math.max(
          0,
          Math.min(data.limit_gar, stp2Result, data.limit_gar - totalRbtSin)
        );
        console.log(calculatedRbt);

        // Push the result to finalResult
        finalResult.push({
          result: totalRbtSin,
          status: "OK",
        });
      } else if (data.applied_on === "Bénéficiaire") {
        console.log(data.applied_on);

        const querySinTemp =
          "SELECT SUM(rbt_sin) AS total_rbt_sin_temp FROM decla_sin_temp WHERE id_souscript = ? AND id_adherent = ? AND id_fam = ? AND id_nomencl = ? AND strd = 0";
        const sinTempValues = [
          data.id_souscript,
          data.id_adherent,
          data.id_fam,
          data.id_nomencl,
        ];

        const sinTempRows = await db.query(querySinTemp, sinTempValues);
        const totalRbtSinInSinTemp = sinTempRows[0][0].total_rbt_sin_temp || 0;

        const queryStrdSin =
          "SELECT SUM(rbt_sin) AS total_rbt_sin_strd FROM stored_sin WHERE id_souscript = ? AND id_adherent = ? AND id_fam = ? AND id_nomencl = ?";
        const strdSinValues = [
          data.id_souscript,
          data.id_adherent,
          data.id_fam,
          data.id_nomencl,
        ];
        const strdSinrows = await db.query(queryStrdSin, strdSinValues);
        const totalRbtSinInStrdSin = strdSinrows[0][0].total_rbt_sin_strd || 0;
        console.log(strdSinrows);

        console.log("resultat 1", totalRbtSinInSinTemp);
        console.log("resultat 2", totalRbtSinInStrdSin);

        let totalRbtSin = totalRbtSinInSinTemp + totalRbtSinInStrdSin;

        calculatedRbt = Math.max(
          0,
          Math.min(data.limit_gar, stp2Result, data.limit_gar - totalRbtSin)
        );
        console.log(calculatedRbt);

        // Push the result to finalResult
        finalResult.push({
          result: totalRbtSin,
          status: "OK",
        });
      } else {
        finalResult.push({
          result: stp2Result,
          status: stp2status,
        });
      }
    } else {
      // Si le 1er bloc de conditions retourne un mauvais resultat

      finalResult.push({
        result: stp2Result,
        status: stp2status,
      });
    }
    console.log(finalResult);
    res.status(200).json({
      data: responseData,
      resultStatus: resultStatusArray,
      newArray: finalResult,
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///_______//////////////////////__________________PUT ONLY ON STRD COLUMN_________///////////////////////////////////______________
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
