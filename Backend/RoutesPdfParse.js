const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFParser = require("pdf-parse");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

router.get("/", (req, res) => {
  res.send("Hello!");
});

router.post("/", upload.single(), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = path.join(__dirname, req.file.path);
    const dataBuffer = fs.readFileSync(filePath);

    // Use pdf-parse to parse the PDF content
    const data = await PDFParser(dataBuffer);

    // Access the parsed text using 'text' property
    const parsedText = data.text.replace(/\\n/g, "\n");

    // You can now use 'parsedText' which contains the parsed text
    //console.log("Parsed PDF Content:", parsedText);

    // Send the parsed text as the response
    res.status(200).json({ parsedText });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
