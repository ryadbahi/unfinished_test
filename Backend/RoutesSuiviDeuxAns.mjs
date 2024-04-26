import { Router } from "express";
import db from "./dbLink.mjs";

const router = Router();

router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/*_____________________________________________________________________________
_______________________________________________________________________________
________________________________   GET   ______________________________________
_______________________________________________________________________________
_____________________________________________________________________________*/

//________________________GET CYCLE______________________________

router.get("/souscript/:id_souscript", async (req, res, next) => {
  const data = req.params.id_souscript;

  const selectQuery = `SELECT * FROM cycle WHERE id_souscript = ?`;
  try {
    const [results] = await db.query(selectQuery, data);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

//________________________GET CYCLE with id cycle______________________________

router.get("/cycle/:id_cycle", async (req, res, next) => {
  const data = req.params.id_cycle;

  const selectQuery = `SELECT * FROM cycle WHERE id_cycle = ?`;
  try {
    const [results] = await db.query(selectQuery, data);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

//________________________ GET SUIVI ______________________________

router.get("/cycle///////:id_cycle", async (req, res, next) => {
  const data = req.params.id_cycle;

  const selectQuery = `SELECT * FROM suivideuxans WHERE id_cycle = ?`;
  try {
    const [results] = await db.query(selectQuery, data);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

export default router;
