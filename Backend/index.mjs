import express from "express";
import bodyParsers from "body-parser";
import cors from "cors";
import mailreportsRoutes from "./RoutesMailreports.mjs";
import adherentsRoutes from "./Routesadherents.mjs";
import contratsRoutes from "./RoutesContrats.mjs";
import souscripteursRoutes from "./RoutesSouscripteurs.mjs";
import dpt_sinRoutes from "./RoutesDPT_Sin.mjs";
import familyRoutes from "./RoutesFamily_adh.mjs";
import PdfParseRoutes from "./RoutesPdfParse.mjs";
import paraphRoutes from "./RoutesParaph.mjs";
import paraph_ovRoutes from "./RoutesParah_ov.mjs";
import nomencleRoutes from "./RoutesNomencl.mjs";
import optionsRoutes from "./RoutesOptions.mjs";
import Decla_Sin_TempRoutes from "./RoutesDecla_Sin_Temp.mjs";
import abbrevRoutes from "./RoutesAbbrev.mjs";
import storedSin from "./RoutesStoredSin.mjs";
import liensBenefRoutes from "./RoutesLiensBenef.mjs";
import suiviDeuxAnsRoutes from "./RoutesSuiviDeuxAns.mjs";

const app = express();
app.use(bodyParsers.json());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  next();
  console.log(req.body); // Log the raw request body
});

app.use("/liens_benef", liensBenefRoutes);

//_________________________SUIVI DEUX ANS__________________________________

app.use("/suivideuxans", suiviDeuxAnsRoutes);

//_________________________STORED SINISTRES_______________________________
app.use("/stored_sin", storedSin);
//______________________________ABBREV_______________________________________

app.use("/abbrev_sous", abbrevRoutes);

//______________________________OPTIONS______________________________________

app.use("/options", optionsRoutes);

//------------------------NOMENCLATURE TABLE----------------------------------

app.use("/nomencl", nomencleRoutes);

// -------------------------PARAPHEUR GET--------------------------------------

app.use("/paraph_ov", paraph_ovRoutes);

// -------------------------PARAPHEUR POSTING--------------------------------------

app.use("/parapheur_titles", paraphRoutes);

// -------------------------PDF PARSING--------------------------------------

app.use("/PdfParse", PdfParseRoutes);

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
