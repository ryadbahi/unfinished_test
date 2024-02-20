const express = require("express");

const db = require("./dbLink");
const router = express.Router();

// Error handler middleware
router.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// _____________ Nomencle POST ________________

router.post("/", async (req, res) => {
  try {
    const { code_garantie, garantie_describ } = req.body;
    const result = await db.query(
      "INSERT INTO nomencl (code_garantie, garantie_describ) VALUES (?, ?)",
      [code_garantie, garantie_describ]
    );
    res
      .status(201)
      .json({ message: "Nomencle item created successfully", result });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM nomencl");

    if (result.length > 0) {
      const categorizedData = categorizeByCategory(result);
      res.status(200).json(categorizedData);
    } else {
      res.status(404).json({ error: "No items found" });
    }
  } catch (err) {
    next(err);
  }
});

// Function to categorize the result
function categorizeByCategory(data) {
  const categories = {
    A: "Honoraires Médicaux",
    B: "Pharmacie",
    C: "Dentaire",
    F: "Hospitalisation",
    G: "Maternité",
    E: "Optique",
    H: "Actes exploratoires",
    J: "Indemnités Forfaitaires",
    D: "Prothèse",
    I: "Assistance",
    L: "Incapacité Permanente",
    M: "Décès – IAD – Maladies redoutées",
    N: "Décès -Invalidité Absolue et Définitive",
    K: "Tiers Payants",
  };

  const categorizedData = [];

  try {
    Object.keys(categories).forEach((categoryKey) => {
      const categoryName = categories[categoryKey];
      const categoryData = data[0].filter(
        (item) => item.code_garantie[0] === categoryKey
      );

      // Push an object with consistent structure
      categorizedData.push({ category: categoryName, items: categoryData });
    });
  } catch (error) {
    console.error("Error categorizing data:", error);
  }

  return categorizedData;
}

// _____________ Nomencle GET by ID ________________

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      "SELECT * FROM nomencl WHERE 	id_nomencl  = ?",
      [id]
    );
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: "Nomencle item not found" });
    }
  } catch (err) {
    next(err);
  }
});

// _____________ Nomencle DELETE ________________

router.delete(":id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query("DELETE FROM nomencl WHERE id_nomencl = ?", [
      id,
    ]);
    res.status(200).json({
      message: `Nomencle item with ID ${id} deleted successfully`,
      result,
    });
  } catch (err) {
    next(err);
  }
});

// _____________ Nomencle PUT ________________

router.put(":id", async (req, res) => {
  try {
    const id = req.params.id;
    const { code_garantie, garantie_describ } = req.body;
    const result = await db.query(
      "UPDATE nomencl SET code_garantie = ?, garantie_describ = ? WHERE id_nomencl = ?",
      [code_garantie, garantie_describ, id]
    );
    res.status(200).json({
      message: `Nomencle item with ID ${id} updated successfully`,
      result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
