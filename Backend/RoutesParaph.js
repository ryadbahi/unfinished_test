const express = require("express");
const db = require("./dbLink");
const multer = require("multer");
const upload = multer();
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// PARAPHEUR CREATE____________________________________________
router.post("/", upload.single("pdf_ov"), async (req, res, next) => {
  console.log(req.body);

  try {
    // Parse the JSON data sent in the request
    const parapheurTitlesData = JSON.parse(req.body.parapheurTitlesData);

    console.log("num_sin:", parapheurTitlesData.num_sin);
    console.log("trt_par:", parapheurTitlesData.trt_par);
    console.log("souscript:", parapheurTitlesData.souscript);

    // Extract pdfData from the file buffer
    const pdfData = Buffer.from(req.file.buffer);
    console.log("pdfData:", pdfData);

    console.log("ref_ov:", parapheurTitlesData.ref_ov);

    let connection;

    try {
      // Start a transaction
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Get the original file name
      const originalFileName = req.file.originalname;

      // Generate a unique name for storing in the database (if needed)
      const storedFileName = `${uuidv4()}_${originalFileName}`;

      // Insert into parapheur_titles with explicit column names, including original filename
      const insertTitlesQuery =
        "INSERT INTO parapheur_titles (num_sin, trt_par, souscript, pdf_ov, ref_ov, pdf_file_name) VALUES (?, ?, ?, ?, ?, ?)";
      const [titlesResult] = await connection.query(insertTitlesQuery, [
        parapheurTitlesData.num_sin,
        parapheurTitlesData.trt_par,
        parapheurTitlesData.souscript,
        pdfData,
        parapheurTitlesData.ref_ov,
        originalFileName, // Add original filename to the query
      ]);

      // Get the inserted id for linking with paraphdetails
      const idParaph = titlesResult.insertId;

      // Save the file with the original name
      const pdfFilePath = path.join(__dirname, "uploads", originalFileName);
      fs.writeFileSync(pdfFilePath, pdfData);

      // Insert into paraphdetails with explicit column names
      const insertVirmntsQuery =
        "INSERT INTO paraphdetails (benef_virmnt, rib, montant, id_paraph) VALUES (?, ?, ?, ?)";
      for (const virmntData of parapheurTitlesData.paraphdetails) {
        await connection.query(insertVirmntsQuery, [
          virmntData.benef_virmnt,
          virmntData.rib,
          virmntData.montant,
          idParaph,
        ]);
      }

      // Commit the transaction if everything is successful
      await connection.commit();

      const filePath = path.join(__dirname, "uploads", originalFileName);
      fs.unlinkSync(filePath);
      // Release the connection
      connection.release();

      res.status(200).json({ message: "Data inserted successfully" });
    } catch (err) {
      // Rollback the transaction in case of an error
      if (connection) {
        await connection.rollback();
        // Release the connection
        connection.release();
      }

      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// PARAPHEUR GET_______________________________________
router.get("/", async (req, res, next) => {
  const selectQuery = `
      SELECT 
        pt.*,
        pv.id_virmnt,
        pv.benef_virmnt,
        pv.rib,
        pv.montant,
        pv.added as virmnt_added,
        pv.last_updated as virmnt_last_updated
      FROM parapheur_titles pt
      LEFT JOIN paraphdetails pv ON pt.id_paraph = pv.id_paraph
    `;

  try {
    const [results] = await db.query(selectQuery);

    // Organize the data into a structure that groups paraphdetails under each parapheur_titles
    const dataMap = new Map();
    results.forEach((row) => {
      const idParaph = row.id_paraph;

      if (!dataMap.has(idParaph)) {
        // Initialize the parapheur_titles data along with an array for paraphdetails
        dataMap.set(idParaph, {
          ...row,
          paraphdetails: [],
        });
      }

      // If paraphdetails data exists, add it to the array
      if (row.id_virmnt) {
        dataMap.get(idParaph).paraphdetails.push({
          id_virmnt: row.id_virmnt,
          benef_virmnt: row.benef_virmnt,
          rib: row.rib,
          montant: row.montant,
          added: row.virmnt_added,
          last_updated: row.virmnt_last_updated,
        });
      }
    });

    // Convert the Map values to an array for the response
    const organizedResults = Array.from(dataMap.values());

    res.status(200).json(organizedResults);
  } catch (err) {
    next(err);
  }
});

// PARAPHEUR GET BY ID________________________________

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const selectSingleQuery =
    "SELECT * FROM parapheur_titles WHERE id_paraph = ?";

  try {
    const [results] = await db.query(selectSingleQuery, [id]);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

// PARAPHEUR DELETE____________________________________________
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM parapheur_titles WHERE id_paraph = ?";

  try {
    await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
