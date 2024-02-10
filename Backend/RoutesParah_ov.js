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

module.exports = router;
