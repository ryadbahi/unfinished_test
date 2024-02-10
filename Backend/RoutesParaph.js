const express = require("express");
const db = require("./dbLink");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// PARAPHEUR CREATE____________________________________________

router.post("/", upload.any(), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    // Extract data from the request body
    const { ref_ov } = req.query; // Extract ref_ov from query parameters

    // Iterate over each paraphTable in the request body
    for (let i = 0; req.body[`paraphTable_${i}`]; i++) {
      const paraphTable = JSON.parse(req.body[`paraphTable_${i}`]);

      // Check if paraph_ov with the same ref_ov already exists
      const [existingParaphOv] = await db.query(
        "SELECT * FROM paraph_ov WHERE ref_ov = ?",
        [ref_ov]
      );

      let paraphOvId;

      if (existingParaphOv.length > 0) {
        // Use the existing paraph_ov record
        paraphOvId = existingParaphOv[0].id_ov;
      } else {
        // Insert into paraph_ov table if it doesn't exist
        const [paraphOvResult] = await db.query(
          "INSERT INTO paraph_ov (ref_ov) VALUES (?)",
          [ref_ov]
        );
        paraphOvId = paraphOvResult.insertId;
      }

      // Assuming there's always one file
      const pdfFile = req.files[i];

      // Insert into parapheur_titles table
      const [parapheurTitlesResult] = await db.query(
        "INSERT INTO parapheur_titles (id_ov, num_sin, trt_par, souscript, ref_ov, pdf_file_name, pdf_ov) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          paraphOvId,
          paraphTable.num_sin,
          paraphTable.trt_par,
          paraphTable.souscript,
          ref_ov,
          pdfFile.originalname,
          pdfFile.buffer,
        ]
      );

      // Insert into paraphdetails table
      for (let detail of paraphTable.paraphdetails) {
        await db.query(
          "INSERT INTO paraphdetails (id_paraph, benef_virmnt, rib, montant) VALUES (?, ?, ?, ?)",
          [
            parapheurTitlesResult.insertId,
            detail.benef_virmnt,
            detail.rib,
            detail.montant,
          ]
        );
      }
    }

    res.status(201).json({ message: "Parapheur entry created successfully" });
  } catch (error) {
    console.error("Error creating parapheur entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PARAPHEUR GET_______________________________________
router.get("/", async (req, res, next) => {
  try {
    const selectQuery = `
      SELECT 
        pov.*,
        pt.*,
        pv.id_virmnt,
        pv.benef_virmnt,
        pv.rib,
        pv.montant,
        pv.added as virmnt_added,
        pv.last_updated as virmnt_last_updated
      FROM paraph_ov pov
      LEFT JOIN parapheur_titles pt ON pov.id_ov = pt.id_ov
      LEFT JOIN paraphdetails pv ON pt.id_paraph = pv.id_paraph;
    `;

    const [results] = await db.query(selectQuery);

    // Organize the data into a structure that groups paraphdetails under each parapheur_titles
    const dataMap = new Map();
    results.forEach((row) => {
      const idOv = row.id_ov;
      const idParaph = row.id_paraph;

      if (!dataMap.has(idOv)) {
        // Initialize the paraph_ov data along with an array for ParaphTable
        dataMap.set(idOv, {
          id_ov: row.id_ov,
          ref_ov: row.ref_ov,
          file_ov: row.file_ov,
          added: row.added,
          ParaphTable: [],
        });
      }

      let paraphTable = dataMap
        .get(idOv)
        .ParaphTable.find((pt) => pt.id_paraph === idParaph);
      if (!paraphTable) {
        // If ParaphTable data exists, add it to the array
        paraphTable = {
          id_paraph: row.id_paraph,
          num_sin: row.num_sin,
          trt_par: row.trt_par,
          souscript: row.souscript,
          pdf_ov: row.pdf_ov, // You might want to handle the pdf_ov column appropriately
          ref_ov: row.ref_ov,
          pdf_file_name: row.pdf_file_name,
          paraphdetails: [],
        };
        dataMap.get(idOv).ParaphTable.push(paraphTable);
      }

      // If paraphdetails data exists, add it to the array
      if (row.id_virmnt) {
        paraphTable.paraphdetails.push({
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
