const express = require("express");
const db = require("./dbLink");
const router = express.Router();

router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

//_____________________________POST_______________________________
// Assuming this function is defined somewhere
async function insertOption(id_contrat, limit_plan, num, option_describ) {
  const insertQuery = `
      INSERT INTO options (id_contrat, limit_plan, num, option_describ)
      VALUES (?, ?, ?, ?)`;

  const [result] = await db.query(insertQuery, [
    id_contrat,
    limit_plan,
    num,
    option_describ,
  ]);
  console.log("Inserted into options table. ID:", result.insertId);
  return result.insertId; // Assuming id_opt is an auto-increment field
}

router.post("/", async (req, res, next) => {
  const { id_contrat, limit_plan, num, dynamicForm } = req.body;

  try {
    // Insert data into the options table
    const id_opt = await insertOption(
      id_contrat,
      limit_plan,
      num /* option_describ */
    );
    console.log("Inserted into options table. id_opt:", id_opt);

    // Insert data into the fmp table for each item in dynamicForm
    for (const item of dynamicForm) {
      const {
        id_nomencl,
        applied_on,
        taux_rbt,
        limit_gar,
        limit_gar_describ,
        nbr_of_unit,
        unit_value,
      } = item;

      const insertFmpQuery = `
          INSERT INTO fmp (id_opt, id_nomencl, applied_on, taux_rbt, limit_gar, limit_gar_describ, nbr_of_unit, unit_value)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      await db.query(insertFmpQuery, [
        id_opt,
        id_nomencl,
        applied_on,
        taux_rbt,
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

module.exports = router;
