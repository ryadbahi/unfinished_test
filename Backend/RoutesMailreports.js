const express = require("express");
const { format } = require("date-fns");
const db = require("./dbLink");

const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// MAIL REPORTS - POST
router.post("/", async (req, res) => {
  const dataInput = req.body;

  try {
    // Check if dataInput is an array
    if (Array.isArray(dataInput)) {
      // If it's an array, loop through each record
      for (const data of dataInput) {
        await insertMailReport(data);
      }
    } else {
      // If it's not an array, insert it as a single record
      await insertMailReport(dataInput);
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

async function insertMailReport(data) {
  const {
    reception,
    canal,
    traite_par,
    agence,
    contrat,
    souscripteur,
    adherent,
    objet,
    statut,
    reponse,
    tdr,
    score,
    observation,
  } = data;

  // Format the date from 'dd/MM/yyyy HH:mm:ss' to 'yyyy-MM-dd HH:mm:ss'
  const recepformattedDate = format(new Date(reception), "yyyy-MM-dd HH:mm:ss");
  const repformattedDate = format(new Date(reponse), "yyyy-MM-dd HH:mm:ss");

  const insertQuery = `
    INSERT INTO mailreports (
      reception,
      canal,
      traite_par,
      agence,
      contrat,
      souscripteur,
      adherent,
      objet,
      statut,
      reponse,
      tdr,
      score,
      observation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      recepformattedDate,
      canal,
      traite_par,
      agence,
      contrat,
      souscripteur,
      adherent,
      objet,
      statut,
      repformattedDate,
      tdr,
      score,
      observation,
    ]);
    console.log("Insert successful");
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    throw err;
  }
}

// MAIL REPORTS - GET with pagination
router.get("/", async (req, res, next) => {
  const {
    page = page || 1,
    pageSize = pageSize || 10,
    sortBy = "id_mail",
    sortOrder = "desc",
    search = "",
  } = req.query;

  // Validate sortBy and sortOrder here to prevent SQL injection
  const validColumns = [
    "id_mail",
    "reception",
    "canal",
    "traite_par",
    "agence",
    "contrat",
    "souscripteur",
    "adherent",
    "objet",
    "statut",
    "reponse",
    "tdr",
    "score",
    "observation",
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
    SELECT * FROM mailreports
    WHERE CONCAT(id_mail, ' ') LIKE ? 
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ?, ?`;

  let countQuery = `
    SELECT COUNT(*) as total FROM mailreports
    WHERE CONCAT(id_mail, ' ') LIKE ?`;

  try {
    const [results] = await db.query(selectQuery, [
      `%${search}%`,
      offset,
      limit,
    ]);
    const [totalResult] = await db.query(countQuery, [`%${search}%`]);
    const total = totalResult[0].total;

    res.status(200).json({ data: results, total: total });
  } catch (err) {
    next(err);
  }
});

// MAIL REPORTS GET a single record by ID
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const selectSingleQuery = "SELECT * FROM mailreports WHERE id_mail = ?";

  try {
    const [results] = await db.query(selectSingleQuery, [id]);
    res.status(200).json(results);
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// MAIL REPORTS DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM mailreports WHERE id_mail = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

// MAIL REPORTS UPDATE - PUT
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const {
    reception,
    canal,
    traite_par,
    agence,
    contrat,
    souscripteur,
    adherent,
    objet,
    statut,
    reponse,
    tdr,
    score,
    observation,
  } = req.body;

  // Format reception et reponse dates
  const formattedReception = format(new Date(reception), "yyyy-MM-dd HH:mm:ss");
  const formattedreponse = format(new Date(reponse), "yyyy-MM-dd HH:mm:ss");

  const updateQuery =
    "UPDATE mailreports SET reception = ?, canal = ?, traite_par = ?, agence = ?, contrat = ?, souscripteur = ?, adherent = ?, objet = ?, statut = ?, reponse = ?, tdr = ?, score = ?, observation = ? WHERE id_mail = ?";
  try {
    await db.query(updateQuery, [
      formattedReception,
      canal,
      traite_par,
      agence,
      contrat,
      souscripteur,
      adherent,
      objet,
      statut,
      formattedreponse,
      tdr,
      score,
      observation,
      id,
    ]);
    res.status(200).json({ message: "Request updated successfully" });
  } catch (err) {
    next(err); // Pass the error to the error handler middleware
  }
});

module.exports = router;
