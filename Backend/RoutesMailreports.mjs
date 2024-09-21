import { Router } from "express";
import { format } from "date-fns";
import db from "./dbLink.mjs";
import multer from "multer";
import MsgReaderOrExports from "@kenjiuno/msgreader";
import fs from "fs";

const MsgReader = MsgReaderOrExports.default || MsgReaderOrExports;
const router = Router();
const upload = multer({ dest: "uploads/" });

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
    content,
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
      content,
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(insertQuery, [
      recepformattedDate,
      canal,
      content,
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

// _______________________________________MAIL REPORTS - GET with pagination_______________________________________
router.get("/", async (req, res, next) => {
  const {
    page = page || 1,
    pageSize = pageSize || 10,
    sortBy = "id_mail",
    sortOrder = "desc",
    search = "",
    getAllData = false,
  } = req.query;

  // Validate sortBy and sortOrder here to prevent SQL injection
  const validColumns = [
    "id_mail",
    "reception",
    "canal",
    "content",
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
  WHERE CONCAT(
    COALESCE(id_mail, ''), ' ',
    COALESCE(reception, ''), ' ',
    COALESCE(canal, ''), ' ',
    COALESCE(content, ''), ' ',
    COALESCE(traite_par, ''), ' ',
    COALESCE(agence, ''), ' ',
    COALESCE(contrat, ''), ' ',
    COALESCE(souscripteur, ''), ' ',
    COALESCE(adherent, ''), ' ',
    COALESCE(objet, ''), ' ',
    COALESCE(statut, ''), ' ',
    COALESCE(reponse, ''), ' ',
    COALESCE(tdr, ''), ' ',
    COALESCE(score, ''), ' ',
    COALESCE(observation, '')
  ) LIKE ? 
  ORDER BY ${sortBy} ${sortOrder}
  ${getAllData ? "" : "LIMIT ?, ?"}`; // Use LIMIT only if not fetching all data

  let countQuery = `
  SELECT COUNT(*) as total FROM mailreports
  WHERE CONCAT(
    COALESCE(id_mail, ''), ' ',
    COALESCE(reception, ''), ' ',
    COALESCE(canal, ''), ' ',
    COALESCE(content, ''), ' ',
    COALESCE(traite_par, ''), ' ',
    COALESCE(agence, ''), ' ',
    COALESCE(contrat, ''), ' ',
    COALESCE(souscripteur, ''), ' ',
    COALESCE(adherent, ''), ' ',
    COALESCE(objet, ''), ' ',
    COALESCE(statut, ''), ' ',
    COALESCE(reponse, ''), ' ',
    COALESCE(tdr, ''), ' ',
    COALESCE(score, ''), ' ',
    COALESCE(observation, '')
  ) LIKE ?`;

  try {
    const [averageDurationResult] = await db.query(`
      SELECT SEC_TO_TIME(AVG(TIME_TO_SEC(STR_TO_DATE(score, '%Hh %im %ss')))) AS average_duration
      FROM mailreports;
    `);

    const [results] = await db.query(selectQuery, [
      `%${search}%`,
      offset,
      limit,
    ]);

    const [abbrevResults] = await db.query("SELECT * FROM abbrev_sous");

    // Create a map for quick lookup
    const abbrevMap = new Map();
    abbrevResults.forEach((row) => {
      abbrevMap.set(row.full_souscr, row.abbrev_souscr);
    });

    // Add abbrev_sousc to each row in results
    results.forEach((row) => {
      row.abbrev_sousc = abbrevMap.has(row.souscripteur)
        ? abbrevMap.get(row.souscripteur)
        : row.souscripteur;
    });
    const [totalResult] = await db.query(countQuery, [`%${search}%`]);
    const total = totalResult[0].total;

    res.status(200).json({
      data: results,
      total: total,
      averageDuration: averageDurationResult[0].average_duration,
    });
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

//_______________Vider la table___________________________

router.delete("/", async (req, res, next) => {
  const deleteQuery = "DELETE FROM mailreports";

  try {
    await db.query(deleteQuery);
    res.status(200).json({ message: "All data deleted successfully" });
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

//_________________________________PARSING MSG________________________________________________

//___________CALCULATE BUSINESS HOURS___________________________

function calculateBusinessTimeDifference(reception, reponse) {
  let BUSINESS_START_HOUR = 8;
  let BUSINESS_START_MINUTE = 30;
  let BUSINESS_END_HOUR = 16;
  let BUSINESS_END_MINUTE = 15;
  let totalMinutes = 0;

  reception = new Date(reception.getTime());
  reponse = new Date(reponse.getTime());

  while (reception < reponse) {
    let businessStart = new Date(reponse.getTime());
    businessStart.setHours(BUSINESS_START_HOUR, BUSINESS_START_MINUTE, 0);

    let businessEnd = new Date(reception.getTime());
    businessEnd.setHours(BUSINESS_END_HOUR, BUSINESS_END_MINUTE, 0);

    if (
      reception >= businessStart &&
      reception < businessEnd &&
      reception.getDay() !== 5 &&
      reception.getDay() !== 6
    ) {
      totalMinutes++;
    }
    reception.setMinutes(reception.getMinutes() + 1);
  }
  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;
  let formattedTimeDifference = `${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m 00s`;

  return formattedTimeDifference;
}

function timeDiff(reception, reponse) {
  reception = new Date(reception.getTime());
  reponse = new Date(reponse.getTime());

  let timeDifference = Math.abs(reponse.getTime() - reception.getTime());
  let hours = Math.floor(timeDifference / (1000 * 60 * 60));
  let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  let formattedTDR = `${hours
    .toString()
    .padStart(2, "0")}h ${minutes}m ${seconds}s`;

  return formattedTDR;
}

router.post("/msg", upload.array("files"), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No Files uploaded" });
    }

    let reports = [];

    for (let file of req.files) {
      const filePath = file.path;
      const dataBuffer = fs.readFileSync(filePath);
      const msgReader = new MsgReader(dataBuffer);
      const mail = msgReader.getFileData();

      let subjectMatch = mail.normalizedSubject.match(
        /\s*(\w+)\s*(\d+\s*\d+\s*\d+\s*\d+)(?:\/\d+)?\s*-\s*([^\/]+)\s*\/\s*([^:]+)\s*:/
      );
      let sentOnDate = null;
      let sentOnMatch = mail.body.match(/Envoyé : (.+)/);
      let sentOnString = sentOnMatch[1];

      let reponseTime = new Date(mail.clientSubmitTime);
      let months = {
        janvier: "January",
        février: "February",
        mars: "March",
        avril: "April",
        mai: "May",
        juin: "June",
        juillet: "July",
        août: "August",
        septembre: "September",
        octobre: "October",
        novembre: "November",
        décembre: "December",
      };

      for (let month in months) {
        sentOnString = sentOnString.replace(month, months[month]);
      }

      sentOnDate = new Date(Date.parse(sentOnString));

      const report = {
        reception: sentOnDate,
        canal: "Mail",

        agence: subjectMatch[1],
        contrat: subjectMatch[1] + " " + subjectMatch[2],
        souscripteur: subjectMatch[3].trim(),
        adherent: subjectMatch[4].trim(),
        content:
          mail.normalizedSubject +
          "\n" +
          "\n" +
          mail.clientSubmitTime +
          "\n" +
          "\n" +
          mail.body,
        reponse: reponseTime,
        objet: "Mise à jour profil",
        tdr: timeDiff(sentOnDate, reponseTime),
        score: calculateBusinessTimeDifference(sentOnDate, reponseTime),
        statut: "Réglée",
        observation: "Profil mis à jour",
      };
      await insertMailReport(report);
      reports.push(report);

      fs.unlinkSync(filePath);
    }

    res.status(200).json({ reports });
  } catch (error) {
    fs.unlinkSync(filePath);
    next(error);
  }
});

export default router;
