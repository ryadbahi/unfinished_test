const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mailreportsRoutes = require("./RoutesMailreports.js");
const adherentsRoutes = require("./Routesadherents.js");
const contratsRoutes = require("./RoutesContrats.js");
const souscripteursRoutes = require("./RoutesSouscripteurs.js");
const dpt_sinRoutes = require("./RoutesDPT_Sin.js");
const familyRoutes = require("./RoutesFamily_adh.js");
const PdfPrarseRoutes = require("./RoutesPdfParse.js");
const paraphRoutes = require("./RoutesParaph.js");
const paraph_ovRoutes = require("./RoutesParah_ov.js");
const nomencleRoutes = require("./RoutesNomencl.js");
const optionsRoutes = require("./RoutesOptions.js");
const Decla_Sin_TempRoutes = require("./RoutesDecla_Sin_Temp.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  next();
  console.log(req.body); // Log the raw request body
});

//______________________________OPTIONS______________________________________

app.use("/options", optionsRoutes);

//------------------------NOMENCLATURE TABLE----------------------------------

app.use("/nomencl", nomencleRoutes);

// -------------------------PARAPHEUR GET--------------------------------------

app.use("/paraph_ov", paraph_ovRoutes);

// -------------------------PARAPHEUR POSTING--------------------------------------

app.use("/parapheur_titles", paraphRoutes);

// -------------------------PDF PARSING--------------------------------------

app.use("/PdfParse", PdfPrarseRoutes);

// -------------------------DPT SIN TEMP--------------------------------------

app.use("/decla_sin_temp", Decla_Sin_TempRoutes);

// -------------------------DPT SINISTRE--------------------------------------
app.use("/dpt_sin", dpt_sinRoutes);

// _________________SOUSCRIPTEURS________________________
app.use("/souscripteurs", souscripteursRoutes);

// ____________________CONTRATS__________________________
app.use("/contrats", contratsRoutes);

//_____________________ADHERENTS_________________________
app.use("/adherents", adherentsRoutes);

//____________________MAILREPORTS________________________
app.use("/mailreports", mailreportsRoutes);

//______________________FAMILY___________________________
app.use("/fam_adh", familyRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
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
