import { Router } from "express";
import db from "./dbLink.mjs";
const router = Router();

router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

//_____________________________POST_______________________________

async function insertOption(id_contrat, limit_plan, num_opt, option_describ) {
  const insertQuery = `
      INSERT INTO options (id_contrat, limit_plan, num_opt, option_describ)
      VALUES (?, ?, ?, ?)`;

  const [result] = await db.query(insertQuery, [
    id_contrat,
    limit_plan,
    num_opt,
    option_describ,
  ]);
  console.log("Inserted into options table. ID:", result.insertId);
  return result.insertId; // Assuming id_opt is an auto-increment field
}

router.post("/", async (req, res, next) => {
  const { id_contrat, limit_plan, num_opt, dynamicForm } = req.body;

  try {
    // Insert data into the options table
    const id_opt = await insertOption(
      id_contrat,
      limit_plan,
      num_opt /* option_describ */
    );
    console.log("Inserted into options table. id_opt:", id_opt);

    // Insert data into the fmp table for each item in dynamicForm
    for (const item of dynamicForm) {
      const {
        id_nomencl,
        applied_on,
        taux_rbt,
        limit_act,
        limit_gar,
        limit_gar_describ,
        nbr_of_unit,
        unit_value,
      } = item;

      const insertFmpQuery = `
          INSERT INTO fmp (id_opt, id_nomencl, applied_on, taux_rbt, limit_act, limit_gar, limit_gar_describ, nbr_of_unit, unit_value)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await db.query(insertFmpQuery, [
        id_opt,
        id_nomencl,
        applied_on,
        taux_rbt,
        limit_act,
        limit_gar,
        limit_gar_describ,
        nbr_of_unit,
        unit_value,
      ]);
      console.log(
        "Inserted into fmp table. id_opt:",
        id_opt,
        "id_nomencl:",
        id_nomencl
      );
    }

    res.status(200).json({ message: "Data successfully inserted." });
  } catch (err) {
    console.error("Error during insertion:", err);
    next(err);
  }
});

//__________________________GET_____________________

router.get("/", async (req, res, next) => {
  const selectQuery = `
      SELECT fmp.*
      FROM options
      LEFT JOIN fmp ON options.id_opt = fmp.id_opt`;

  try {
    const [results] = await db.query(selectQuery);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

router.get("/:id_opt", async (req, res, next) => {
  const id_opt = req.params.id_opt;

  try {
    // Retrieve id_opt based on id_contrat
    const [idOptResults] = await db.query(
      "SELECT id_opt FROM options WHERE id_opt = ?",
      [id_opt]
    );

    if (idOptResults.length === 0) {
      res.status(404).json({ error: "No matching id_opt found" });
      return;
    }

    // Use the id_opt from the request parameters

    // Retrieve corresponding records from fmp table with details from nomencl table
    const selectFmpWithDetailsQuery = `
      SELECT fmp.*, nomencl.code_garantie, nomencl.garantie_describ, options.limit_plan, options.num_opt
      FROM fmp
      JOIN nomencl ON fmp.id_nomencl = nomencl.id_nomencl
      JOIN options ON fmp.id_opt = options.id_opt
      WHERE fmp.id_opt = ?
    `;

    const [fmpResults] = await db.query(selectFmpWithDetailsQuery, [id_opt]);

    res.status(200).json(fmpResults);
  } catch (err) {
    next(err);
  }
});

export default router;
