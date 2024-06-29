import { Router } from "express";
import db from "./dbLink.mjs";
import multer from "multer";
import fs from "fs";
import xlsx from "node-xlsx";
import { error, log } from "console";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/*_____________________________________________________________________________
_______________________________________________________________________________
________________________________   GET   ______________________________________
_______________________________________________________________________________
_____________________________________________________________________________*/

//________________________GET CYCLE______________________________

router.get("/souscript/:id_souscript", async (req, res, next) => {
  const data = req.params.id_souscript;

  const selectQuery = `SELECT * FROM cycle WHERE id_souscript = ?`;
  try {
    const [results] = await db.query(selectQuery, data);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

//________________________GET CYCLE with id cycle______________________________

router.get("/cycle/:id_cycle", async (req, res, next) => {
  const data = req.params.id_cycle;

  const selectQuery = `SELECT * FROM cycle WHERE id_cycle = ?`;
  try {
    const [results] = await db.query(selectQuery, data);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

//________________________ GET CONDITIONS ______________________________

router.get("/conditions/:id", async (req, res, next) => {
  const data = req.params.id;

  const selectQuery = `
  SELECT
      suivideuxans.id_couv,
      suivideuxans.id_cycle,
      suivideuxans.id_nomencl,
      nomencl.code_garantie,
      nomencl.garantie_describ,
      suivideuxans.applied_on,
      suivideuxans.taux_rbt,
      suivideuxans.limit_act,
      suivideuxans.limit_gar,
      suivideuxans.limit_gar_describ,
      suivideuxans.nbr_of_unit,
      suivideuxans.unit_value
FROM suivideuxans 
    LEFT JOIN nomencl ON suivideuxans.id_nomencl = nomencl.id_nomencl
    WHERE id_cycle = ?`;
  try {
    const [results] = await db.query(selectQuery, data);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

//______________________________ GET CONSO ____________________________________

router.get("/conso/:id", async (req, res, next) => {
  const id = req.params.id;
  const { page = 1, pageSize = 10, search = "" } = req.query;
  const offset = (page - 1) * pageSize;

  const countQuery = `SELECT COUNT(*) as total FROM consosuivi WHERE id_cycle = ?`;

  const selectQuery = `
SELECT
    consosuivi.id_conso,
    consosuivi.id_cycle,
    consosuivi.nom_adherent,
    consosuivi.prenom_adherent,
    consosuivi.lien,
    consosuivi.prenom_lien,
    consosuivi.id_nomencl,
    nomencl.code_garantie,
    nomencl.garantie_describ,
    consosuivi.date_sin,
    consosuivi.frais_expo,
    consosuivi.rbt_sin,
    consosuivi.remains,
    consosuivi.forced
  FROM consosuivi
  LEFT JOIN nomencl ON consosuivi.id_nomencl = nomencl.id_nomencl
  WHERE id_cycle = ? 
  AND (consosuivi.nom_adherent LIKE ? OR 
      consosuivi.prenom_adherent LIKE ? OR
      consosuivi.lien LIKE ? OR
      consosuivi.prenom_lien LIKE ? OR
      nomencl.code_garantie LIKE ? OR
      nomencl.garantie_describ LIKE ? OR
      consosuivi.frais_expo LIKE ? OR
      consosuivi.rbt_sin LIKE ?)
  ORDER BY consosuivi.nom_adherent ASC, consosuivi.prenom_adherent, consosuivi.lien, consosuivi.prenom_lien
  LIMIT ? OFFSET ?`;

  try {
    const [totalresult] = await db.query(countQuery, [
      id,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
    ]);

    const [result] = await db.query(selectQuery, [
      id,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      parseInt(pageSize),
      offset,
    ]);

    res.status(200).json({ item: result, total: totalresult[0].total });
  } catch (err) {
    next(err);
  }
});

/*_____________________________________________________________________________
_______________________________________________________________________________
________________________________   POST   _____________________________________
_______________________________________________________________________________
_____________________________________________________________________________*/

router.post("/", async (req, res, next) => {
  const {
    id_souscript,
    cycle,
    date_start,
    contrat_start,
    date_end,
    contrat_end,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO cycle (id_souscript, cycle, date_start, contrat_start, date_end, contrat_end) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id_souscript, cycle, date_start, contrat_start, date_end, contrat_end]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

//________________________________  POST CONDITIONS ___________________________________

router.post("/conditions", async (req, res, next) => {
  try {
    const {
      id_cycle,
      id_nomencl,
      applied_on,
      taux_rbt,
      limit_act,
      limit_gar,
      limit_gar_describ,
      nbr_of_unit,
      unit_value,
    } = req.body;

    const result = await db.query(
      `INSERT INTO suivideuxans (
        id_cycle, id_nomencl, applied_on, taux_rbt, limit_act, limit_gar, limit_gar_describ, nbr_of_unit, unit_value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_cycle,
        id_nomencl,
        applied_on,
        taux_rbt,
        limit_act,
        limit_gar,
        limit_gar_describ,
        nbr_of_unit,
        unit_value,
      ]
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/*_____________________________________________________________________________
_______________________________________________________________________________
________________________________   DELETE   _____________________________________
_______________________________________________________________________________
_____________________________________________________________________________*/

router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM cycle WHERE id_cycle = ?`;

  try {
    await db.query(deleteQuery, id);
    res.status(200).json({ message: "Cycle deleted successfully" });
  } catch (err) {
    next(err);
  }
});

//________________________ DELETE _________________________________________

router.delete("/conditions/:id", async (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM suivideuxans WHERE id_couv = ?`;

  try {
    await db.query(deleteQuery, id);
    res.status(200).json({ message: "Conditions deleted succesfully" });
  } catch (err) {
    next(err);
  }
});

router.delete("/delete/conso/:id", async (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM consosuivi WHERE id_conso = ?`;

  try {
    await db.query(deleteQuery, id);
    res.status(200).json({ message: "Consommation supprimée" });
  } catch (err) {
    next(err);
  }
});

/*_____________________________________________________________________________
_______________________________________________________________________________
________________________________   UPDATE   _____________________________________
_______________________________________________________________________________
_____________________________________________________________________________*/

router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const { cycle, date_start, contrat_start, date_end, contrat_end } = req.body;

  const updateQuery = `UPDATE cycle SET cycle = ?, date_start = ?, contrat_start = ?, date_end = ?, contrat_end = ? WHERE id_cycle = ?`;

  try {
    await db.query(updateQuery, [
      cycle,
      date_start,
      contrat_start,
      date_end,
      contrat_end,
      id,
    ]);
    res.status(200).json({ message: `Cycle mis à jour !` });
  } catch (err) {
    next(err);
  }
});

//____________________________________ UPDATE CONDTIONS __________________________________
router.put("/conditions/update/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      id_nomencl,
      applied_on,
      taux_rbt,
      limit_act,
      limit_gar,
      limit_gar_describ,
      nbr_of_unit,
      unit_value,
    } = req.body;
    const updateQuery = `UPDATE suivideuxans SET
      
      id_nomencl = ?,
      applied_on = ?,
      taux_rbt = ?,
      limit_act = ?,
      limit_gar = ?,
      limit_gar_describ = ?,
      nbr_of_unit = ?,
      unit_value = ? 
    WHERE id_couv = ?`;

    await db.query(updateQuery, [
      id_nomencl,
      applied_on,
      taux_rbt,
      limit_act,
      limit_gar,
      limit_gar_describ,
      nbr_of_unit,
      unit_value,
      id,
    ]);
    res.status(200).json({ message: "Garantie mise à jour" });
  } catch (err) {
    next(err);
  }
});

/*______________________________________________________________________________
________________________________________________________________________________
__________________________   EXCEL PARSING PART   ______________________________
________________________________________________________________________________
______________________________________________________________________________*/

router.post("/excel/:id", upload.single("file"), async (req, res, next) => {
  const id = req.params.id;
  const refdpt = req.body.data;

  const selectQuery = `SELECT id_nomencl FROM suivideuxans WHERE id_cycle = ?`;
  let coveredNomencl = await db.query(selectQuery, id);

  let covered_Id_Nomencl = coveredNomencl[0].map((item) => item.id_nomencl);

  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Parse the Excel file
    const obj = xlsx.parse(req.file.path); // Parses the buffer

    obj[0].data.pop(); //remove the last row
    obj[0].data.shift(); //remove first row

    let consoData = ([] = []);

    for (let row of obj[0].data) {
      let codeNomenc = row[6].split(":")[0];

      let sql = `SELECT id_nomencl FROM nomencl WHERE code_garantie = ?`;

      let id_garentie = await db.query(sql, codeNomenc);
      let id_nomencl = id_garentie[0][0].id_nomencl;

      let dateSin = typeof row[5];
      let FormattedDate = [];

      if (dateSin === "number") {
        let toDate = new Date((row[5] - (25567 + 2)) * 86400 * 1000);
        FormattedDate.push(toDate);
      } else if (dateSin === "string") {
        const dd = row[5].split("-")[0];
        const mm = row[5].split("-")[1];
        const yyyy = row[5].split("-")[2];

        let yyyyMMdd = yyyy + "-" + mm + "-" + dd;
        let toDate = new Date(yyyyMMdd);

        FormattedDate.push(toDate);
      } else {
        FormattedDate.push(dateSin);
      }

      const consoInterface = {
        id_cycle: id,
        idx_on_file: row[0],
        nom_adherent: row[1],
        prenom_adherent: row[2],
        lien: row[3],
        prenom_lien: row[4],
        date_sin: FormattedDate[0],
        id_nomencl: id_nomencl,
        frais_expo: row[7],
        rbt_sin: row[8],
        remains: 0,
        rib: row[9],
        obs_on_file: row[10],
        ref_dpt: refdpt,
        forced: 0,
      };

      if (covered_Id_Nomencl.includes(consoInterface.id_nomencl)) {
        consoData.push(consoInterface);
      }
    }
    //console.log(consoData);

    let query = `INSERT INTO consosuivi SET ?`;

    for (let data of consoData) {
      await db.query(query, data);
    }

    res.status(200).json("File uploaded and parsed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

router.get("/consosuivi/:id", async (req, res, next) => {
  const idCycle = req.params.id;

  const selectConditions = `
    SELECT id_nomencl, applied_on, taux_rbt, limit_act, limit_gar, nbr_of_unit, unit_value 
    FROM suivideuxans 
    WHERE id_cycle = ?`;
  const selectCycle = `
    SELECT date_start, date_end 
    FROM cycle 
    WHERE id_cycle = ?`;
  const selectConso = `
    SELECT 
      id_conso, nom_adherent, prenom_adherent, lien, prenom_lien, date_sin, id_nomencl, frais_expo, rbt_sin 
    FROM consosuivi 
    WHERE id_cycle = ?`;

  try {
    const [cycleData] = await db.query(selectCycle, idCycle);
    const [consoData] = await db.query(selectConso, idCycle);
    const [conditionsData] = await db.query(selectConditions, idCycle);

    if (!cycleData.length) {
      return res.status(404).json({ message: "Cycle not found" });
    }

    const { date_start, date_end } = cycleData[0];

    const updates = [];

    const result = consoData.map((conso) => {
      const isWithinRange =
        new Date(conso.date_sin) >= new Date(date_start) &&
        new Date(conso.date_sin) <= new Date(date_end);

      if (!isWithinRange) {
        updates.push({
          id: conso.id_conso,
          fields: { statut: false, rbt_sin: 0 },
        });
      }

      // Add more conditions as needed
      // Example:
      // if (conso.someOtherCondition) {
      //   updates.push({ id: conso.id_conso, fields: { anotherField: newValue } });
      // }

      return {
        ...conso,
        isWithinRange,
      };
    });

    if (updates.length > 0) {
      const updateQueries = updates.map((update) => {
        const fields = Object.entries(update.fields)
          .map(([key, value]) => `${key} = ${db.escape(value)}`)
          .join(", ");
        return `UPDATE consosuivi SET ${fields} WHERE id_conso = ${db.escape(
          update.id
        )}`;
      });

      await Promise.all(updateQueries.map((query) => db.query(query)));
    }

    res.status(200).json({ conditionsData, cycleData, result });
    console.log(conditionsData);
  } catch (err) {
    next(err);
  }
});

export default router;
