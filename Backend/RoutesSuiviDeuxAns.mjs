import { Router } from "express";
import db from "./dbLink.mjs";

const router = Router();

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
  WHERE id_cycle = ?`;

  try {
    const [result] = await db.query(selectQuery, id);
    res.status(200).json(result);
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

export default router;
