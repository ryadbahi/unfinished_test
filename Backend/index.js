const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { format } = require("date-fns");
const db = require("./dbLink.js");
const mailreportsRoutes = require("./RoutesMailreports.js");
const adherentsRoutes = require("./Routesadherents.js");
const contratsRoutes = require("./RoutesContrats.js");
const souscripteursRoutes = require("./RoutesSouscripteurs.js");
const dpt_sinRoutes = require("./RoutesDPT_Sin.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.body); // Log the raw request body
  next();
});

// -------------------------DPT SINISTRE--------------------------------------

app.use("dpt_sin", dpt_sinRoutes);

// _________________SOUSCRIPTEURS________________________
app.use("/souscripteurs", souscripteursRoutes);

// ____________________CONTRATS__________________________
app.use("/contrats", contratsRoutes);

//_____________________ADHERENTS_________________________
app.use("/adherents", adherentsRoutes);

//____________________MAILREPORTS________________________
app.use("/mailreports", mailreportsRoutes);

// Error handler middleware
app.use((err, req, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// _____START SERVER_______
app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.error("Error starting server:", err.message);
  } else {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  }
});
