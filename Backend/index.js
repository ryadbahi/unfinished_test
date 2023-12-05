const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// DB Connect
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "workdata",
  port: "3306",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// connect to the database
db.getConnection()
  .then((connection) => {
    console.log("Connected to database!");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to database:", err.message);
  });

app.use((req, res, next) => {
  console.log(req.body); // Log the raw request body
  next();
});

// -------------------------DPT SINISTRE--------------------------------------

//  DPT_ SIN CREATE - POST
app.post("/dpt_sin", (req, res) => {
  const {
    Assure,
    Prenom_assure,
    Beneficiaire,
    Prenom_beneficiaire,
    Date_sin,
    Categorie_Nomenclature,
    Nomenclature,
    Frais_exposes,
    Remboursement,
    Observation,
    RIB,
    Societe,
    Num_contrat,
    Ref_depot,
  } = req.body;

  const insertQuery = `
        INSERT INTO dpt_sin (
            Assure,
            Prenom_assure,
            Beneficiaire,
            Prenom_beneficiaire,
            Date_sin,
            Categorie_Nomenclature,
            Nomenclature,
            Frais_exposes,
            Remboursement,
            Observation,
            RIB,
            Societe,
            Num_contrat,
            Ref_depot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    insertQuery,
    [
      Assure,
      Prenom_assure,
      Beneficiaire,
      Prenom_beneficiaire,
      Date_sin,
      Categorie_Nomenclature,
      Nomenclature,
      Frais_exposes,
      Remboursement,
      Observation,
      RIB,
      Societe,
      Num_contrat,
      Ref_depot,
    ],
    (err, result) => {
      if (err) {
        console.error("Error executing INSERT query:", err.message);
        res.status(500).json({ error: "Error inserting data" });
      } else {
        res.status(201).json({
          message: "Data inserted successfully",
          insertedId: result.insertId,
        });
      }
    }
  );
});

// DPT_ SIN READ - GET
app.get("/dpt_sin", (req, res) => {
  const selectQuery = "SELECT * FROM dpt_sin";

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error executing SELECT query:", err.message);
      res.status(500).json({ error: "Error fetching data" });
    } else {
      res.status(200).json(results);
    }
  });
});

// DPT_ SIN GET a single record by ID
app.get("/dpt_sin/:id", (req, res) => {
  const id = req.params.id;
  const selectSingleQuery = "SELECT * FROM dpt_sin WHERE id = ?";

  db.query(selectSingleQuery, [id], (err, results) => {
    if (err) {
      console.error("Error executing SELECT query:", err.message);
      res.status(500).json({ error: "Error fetching data" });
    } else {
      res.status(200).json(results);
    }
  });
});

// DPT_ SIN DELETE - DELETE
app.delete("/dpt_sin/:id", (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM dpt_sin WHERE id = ?";

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error executing DELETE query:", err.message);
      res.status(500).json({ error: "Error deleting data" });
    } else {
      res.status(200).json({ message: "Data deleted successfully" });
    }
  });
});

// DPT_ SIN UPDATE - PUT
app.put("/dpt_sin/:id", (req, res) => {
  const id = req.params.id;
  const {
    Assure,
    Prenom_assure,
    Beneficiaire,
    Prenom_beneficiaire,
    Date_sin,
    Categorie_Nomenclature,
    Nomenclature,
    Frais_exposes,
    Remboursement,
    Observation,
    RIB,
    Societe,
    Num_contrat,
    Ref_depot,
  } = req.body;

  const updateQuery = `
    UPDATE dpt_sin
    SET
      Assure = ?,
      Prenom_assure = ?,
      Beneficiaire = ?,
      Prenom_beneficiaire = ?,
      Date_sin = ?,
      Categorie_Nomenclature = ?,
      Nomenclature = ?,
      Frais_exposes = ?,
      Remboursement = ?,
      Observation = ?,
      RIB = ?,
      Societe = ?,
      Num_contrat = ?,
      Ref_depot = ?
    WHERE
      id = ?
  `;

  db.query(
    updateQuery,
    [
      Assure,
      Prenom_assure,
      Beneficiaire,
      Prenom_beneficiaire,
      Date_sin,
      Categorie_Nomenclature,
      Nomenclature,
      Frais_exposes,
      Remboursement,
      Observation,
      RIB,
      Societe,
      Num_contrat,
      Ref_depot,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error executing UPDATE query:", err.message);
        res.status(500).json({ error: "Error updating data" });
      } else {
        res.status(200).json({ message: "Data updated successfully" });
      }
    }
  );
});

// -------------------------SOUSCRIPTEURS--------------------------------------

//SOUSCRIPTEURS CREATE - POSTE
app.post("/souscripteurs", async (req, res) => {
  console.log("Received data:", req.body);
  const {
    nom_souscript,
    adresse_souscript,
    email_souscript_1,
    email_souscript_2,
    email_souscript_3,
    tel_souscript_1,
    tel_souscript_2,
    tel_souscript_3,
    tel_souscript_4,
  } = req.body;

  const insertQuery = `
        INSERT INTO souscripteurs (
            nom_souscript,
            adresse_souscript,
            email_souscript_1,
            email_souscript_2,
            email_souscript_3,
            tel_souscript_1,
            tel_souscript_2,
            tel_souscript_3,
            tel_souscript_4
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  try {
    const result = await db.query(insertQuery, [
      nom_souscript,
      adresse_souscript,
      email_souscript_1,
      email_souscript_2,
      email_souscript_3,
      tel_souscript_1,
      tel_souscript_2,
      tel_souscript_3,
      tel_souscript_4,
    ]);

    res.status(201).json({
      message: "Data inserted successfully",
      insertedId: result.insertId,
    });
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    res.status(500).json({ error: "Error inserting data" });
  }
});

// SOUSCRIPTEURS READ - GET
app.get("/souscripteurs", async (req, res) => {
  const selectQuery = "SELECT * FROM souscripteurs";

  try {
    const [results] = await db.query(selectQuery);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing SELECT query:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// SOUSCRIPTEURS GET a single record by ID
app.get("/souscripteurs/:id", async (req, res) => {
  const id = req.params.id;
  const selectSingleQuery =
    "SELECT * FROM souscripteurs WHERE id_souscript = ?";

  try {
    const [results] = await db.query(selectSingleQuery, [id]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing SELECT query:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// SOUSCRIPTEURS DELETE - DELETE
app.delete("/souscripteurs/:id", async (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM souscripteurs WHERE id_souscript = ?";

  try {
    const [result] = await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    console.error("Error executing DELETE query:", err.message);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// SOUSCRIPTEURS UPDATE - PUT
app.put("/souscripteurs/:id", async (req, res) => {
  const id = req.params.id;
  const {
    nom_souscript,
    adresse_souscript,
    email_souscript_1,
    email_souscript_2,
    email_souscript_3,
    tel_souscript_1,
    tel_souscript_2,
    tel_souscript_3,
    tel_souscript_4,
  } = req.body;

  const updateQuery = `
    UPDATE souscripteurs
    SET
      nom_souscript = ?,
      adresse_souscript = ?,
      email_souscript_1 = ?,
      email_souscript_2 = ?,
      email_souscript_3 = ?,
      tel_souscript_1 = ?,
      tel_souscript_2 = ?,
      tel_souscript_3 = ?,
      tel_souscript_4 = ?
    WHERE
      id_souscript = ?
  `;

  try {
    const [result] = await db.query(updateQuery, [
      nom_souscript,
      adresse_souscript,
      email_souscript_1,
      email_souscript_2,
      email_souscript_3,
      tel_souscript_1,
      tel_souscript_2,
      tel_souscript_3,
      tel_souscript_4,
      id,
    ]);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (err) {
    console.error("Error executing UPDATE query:", err.message);
    res.status(500).json({ error: "Error updating data" });
  }
});

// -------------------------CONTRATS--------------------------------------

// CONTRATS CREATE - POST
app.post("/contrats", async (req, res) => {
  const {
    id_souscript,
    num_contrat,
    date_effet,
    date_exp,
    prime_total,
    Duree_contr,
  } = req.body;

  const insertQuery = `
        INSERT INTO contrats (
            id_souscript,
            num_contrat,
            date_effet,
            date_exp,
            prime_total,
            Duree_contr
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;

  try {
    const [result] = await db.query(insertQuery, [
      id_souscript,
      num_contrat,
      date_effet,
      date_exp,
      prime_total,
      Duree_contr,
    ]);
    res.status(201).json({
      message: "Data inserted successfully",
      insertedId: result.insertId,
    });
  } catch (err) {
    console.error("Error executing INSERT query:", err.message);
    res.status(500).json({ error: "Error inserting data" });
  }
});

// CONTRATS READ - GET
app.get("/contrats", async (req, res) => {
  const selectQuery = "SELECT * FROM contrats";

  try {
    const [results] = await db.query(selectQuery);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing SELECT query:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// CONTRATS GET a single record by ID
app.get("/contrats/:id", async (req, res) => {
  const id = req.params.id;
  const selectSingleQuery = "SELECT * FROM contrats WHERE id_contrat = ?";

  try {
    const [results] = await db.query(selectSingleQuery, [id]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing SELECT query:", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// CONTRATS DELETE - DELETE
app.delete("/contrats/:id", async (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM contrats WHERE id_contrat = ?";

  try {
    const [result] = await db.query(deleteQuery, [id]);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    console.error("Error executing DELETE query:", err.message);
    res.status(500).json({ error: "Error deleting data" });
  }
});

// CONTRATS UPDATE - PUT
app.put("/contrats/:id", async (req, res) => {
  const id = req.params.id;
  const {
    id_souscript,
    num_contrat,
    date_effet,
    date_exp,
    prime_total,
    Duree_contr,
  } = req.body;

  const updateQuery = `
    UPDATE contrats
    SET
      id_souscript = ?,
      num_contrat = ?,
      date_effet = ?,
      date_exp = ?,
      prime_total = ?,
      Duree_contr = ?
    WHERE
      id_contrat = ?
  `;

  try {
    const [result] = await db.query(updateQuery, [
      id_souscript,
      num_contrat,
      date_effet,
      date_exp,
      prime_total,
      Duree_contr,
      id,
    ]);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (err) {
    console.error("Error executing UPDATE query:", err.message);
    res.status(500).json({ error: "Error updating data" });
  }
});

// _____START SERVER_______
app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.error("Error starting server:", err.message);
  } else {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  }
});
