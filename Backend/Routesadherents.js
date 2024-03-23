const express = require("express");
const { format } = require("date-fns");
const db = require("./dbLink");

const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ADHERENTS CREATE - POST
/*router.post("/", async (req, res) => {
  const dataArray = req.body;

  try {
    for (const dataInput of dataArray) {
      // Insert into adherents table
      const adherent = {
        id_souscript: dataInput.id_souscript,
        id_contrat: dataInput.id_contrat,
        id_opt: dataInput.categorie,
        nom_adherent: dataInput.nom_adherent,
        prenom_adherent: dataInput.prenom_adherent,
        date_nai_adh: dataInput.date_nai_adh,
        situa_fam: dataInput.situa_fam,
        rib_adh: dataInput.rib_adh,
        email_adh: dataInput.email_adh,
        tel_adh: dataInput.tel_adh,
        statut: dataInput.statut || "1", // Set default value "1" if statut is empty
        effet_couv: dataInput.effet_couv,
        exp_couv: dataInput.exp_couv,
      };

      let query = "INSERT INTO adherents SET ?";
      let queryResult = await db.query(query, adherent);

      // Get the id of the inserted adherent
      const id_adherent = queryResult[0].insertId;
      console.log("id_adherent:", id_adherent);

      // Insert into fam_adh table
      for (const benef of dataInput.benef) {
        console.log("benef:", benef);

        const fam_adh = {
          id_adherent: id_adherent,
          lien_benef: benef.lien_benef,
          nom_benef: benef.nom_benef,
          prenom_benef: benef.prenom_benef,
          date_nai_benef: benef.date_nai_benef,
        };

        console.log("fam_adh:", fam_adh);

        query = "INSERT INTO fam_adh SET ?";
        await db.query(query, fam_adh);
      }
    }

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});*/

router.post("/", async (req, res) => {
  const dataArray = req.body;

  try {
    for (const dataInput of dataArray) {
      let query =
        "SELECT id_opt FROM options WHERE id_contrat = ? AND num_opt = ?";
      let result = await db.query(query, [
        dataInput.id_contrat,
        dataInput.categorie || 1,
      ]);

      if (result.length > 0) {
        const id_opt = result[0][0].id_opt;

        // Insert into adherents table
        const adherent = {
          id_souscript: dataInput.id_souscript,
          id_contrat: dataInput.id_contrat,
          id_opt: id_opt,
          nom_adherent: dataInput.nom_adherent,
          prenom_adherent: dataInput.prenom_adherent,
          date_nai_adh: dataInput.date_nai_adh,
          situa_fam: dataInput.situa_fam,
          rib_adh: dataInput.rib_adh,
          email_adh: dataInput.email_adh,
          tel_adh: dataInput.tel_adh,
          statut: dataInput.statut || "1",
          effet_couv: dataInput.effet_couv,
          exp_couv: dataInput.exp_couv,
        };

        query = "INSERT INTO adherents SET ?";
        let queryResult = await db.query(query, adherent);

        // Get the id of the inserted adherent
        const id_adherent = queryResult[0].insertId;

        // Insert into fam_adh table
        for (const benef of dataInput.benef) {
          const fam_adh = {
            id_adherent: id_adherent,
            lien_benef: benef.lien_benef,
            nom_benef: benef.nom_benef,
            prenom_benef: benef.prenom_benef,
            date_nai_benef: benef.date_nai_benef,
          };

          query = "INSERT INTO fam_adh SET ?";
          await db.query(query, fam_adh);
        }
      } else {
        console.error(
          "No matching id_opt found for num_opt and id_contrat:",
          dataInput.categorie,
          dataInput.id_contrat
        );
        res.status(500).json({ error: "Internal Server Error" });
        return; // Stop processing further data on error
      }
    }

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ADHERENTS READ - GET
router.get("/", async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "id_adherent",
    sortOrder = "desc",
    search = "",
    getAllData = false,
  } = req.query;

  // Validate sortBy and sortOrder here to prevent SQL injection
  const validColumns = [
    "id_adherent",
    "id_souscript",
    "nom_adherent",
    "prenom_adherent",
    "date_nai_adh",
    "situa_fam",
    "rib_adh",
    "email_adh",
    "tel_adh",
    "statut",
  ];
  if (!validColumns.includes(sortBy)) {
    return res.status(400).json({ error: "Invalid sort column" });
  }
  if (!["asc", "desc"].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({ error: "Invalid sort order" });
  }

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize, 10);

  let selectQuery = `
  SELECT a.*, s.nom_souscript
  FROM adherents a
  LEFT JOIN souscripteurs s ON a.id_souscript = s.id_souscript
  WHERE CONCAT(
    COALESCE(a.id_adherent, ''), ' ',
    COALESCE(s.nom_souscript, ''), ' ',  -- Use s.nom_souscript here
    COALESCE(a.nom_adherent, ''), ' ',
    COALESCE(a.prenom_adherent, ''), ' ',
    COALESCE(a.date_nai_adh, ''), ' ',
    COALESCE(a.situa_fam, ''), ' ',
    COALESCE(a.rib_adh, ''), ' ',
    COALESCE(a.email_adh, ''), ' ',
    COALESCE(a.tel_adh, ''), ' ',
    COALESCE(a.statut, '')
  ) LIKE ? 
  ORDER BY ${sortBy} ${sortOrder}
  ${getAllData ? "" : "LIMIT ?, ?"}`; // Use LIMIT only if not fetching all data

  let countQuery = `
  SELECT COUNT(*) as total FROM adherents
  WHERE CONCAT(
    COALESCE(id_adherent, ''), ' ',
    COALESCE(id_souscript, ''), ' ',
    COALESCE(nom_adherent, ''), ' ',
    COALESCE(prenom_adherent, ''), ' ',
    COALESCE(date_nai_adh, ''), ' ',
    COALESCE(situa_fam, ''), ' ',
    COALESCE(rib_adh, ''), ' ',
    COALESCE(email_adh, ''), ' ',
    COALESCE(tel_adh, ''), ' ',
    COALESCE(statut, '')
  ) LIKE ?`;

  try {
    const [results] = await db.query(selectQuery, [
      `%${search}%`,
      offset,
      limit,
    ]);
    const [totalResult] = await db.query(countQuery, [`%${search}%`]);
    const total = totalResult[0].total;
    res.status(200).json({
      data: results,
      total: total,
    });
    console.log(results);
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// ADHERENTS GET a single record by ID
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const selectQuery = "SELECT * FROM adherents WHERE id_adherent = ?";

  try {
    const [result] = await db.query(selectQuery, [id]);

    if (result.length > 0) {
      result[0].date_nai_adh = format(
        new Date(result[0].date_nai_adh),
        "dd/MM/yyyy"
      );
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: "Adherent not found" });
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// ADHERENTS DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM adherents WHERE id_adherent = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Adherent deleted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// ADHERENTS UPDATE - PUT
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const {
    id_opt,
    nom_adherent,
    prenom_adherent,
    date_nai_adh,
    situa_fam,
    rib_adh,
    email_adh,
    tel_adh,
    statut,
  } = req.body;

  // Format date_nai_adh
  //const parts = date_nai_adh.split("/");
  //const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  const formattedDate_nai = format(new Date(date_nai_adh), "yyyy-MM-dd");

  const updateQuery =
    "UPDATE adherents SET id_opt= ?, nom_adherent = ?, prenom_adherent = ?, date_nai_adh = ?, situa_fam = ?, rib_adh = ?, email_adh = ?, tel_adh = ?, statut = ? WHERE id_adherent = ?";

  try {
    await db.query(updateQuery, [
      id_opt,
      nom_adherent,
      prenom_adherent,
      formattedDate_nai,
      situa_fam,
      rib_adh,
      email_adh,
      tel_adh,
      statut,
      id,
    ]);
    res.status(200).json({ message: "Adherent updated successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

router.get("/souscript/:id_souscript", async (req, res) => {
  const id_souscript = req.params.id_souscript;
  const selectQuery = "SELECT * FROM adherents WHERE id_souscript = ?";

  try {
    const [results] = await db.query(selectQuery, [id_souscript]);

    if (results.length > 0) {
      results.forEach((result) => {
        result.date_nai_adh = format(
          new Date(result.date_nai_adh),
          "dd/MM/yyyy"
        );
      });
      res.status(200).json(results);
    } else {
      res.status(200).json([{ nom_adherent: "Aucun adhérent trouvé" }]);
    }
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

module.exports = router;
