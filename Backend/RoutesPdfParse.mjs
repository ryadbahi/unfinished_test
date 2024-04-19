import { createRequire } from "module";
import { Router } from "express";
import multer from "multer";
import path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const require = createRequire(import.meta.url);
const PDFParser = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({ dest: "uploads/" });
const router = Router();

router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

router.get("/", (req, res) => {
  res.send("Hello!");
});

router.post("/", upload.single("file"), async (req, res) => {
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

    fs.unlinkSync(filePath); //delete the file

    // You can now use 'parsedText' which contains the parsed text

    // Send the parsed text as the response
    res.status(200).json({ parsedText });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
