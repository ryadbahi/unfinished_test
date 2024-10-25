import { Router } from "express";
import db from "./dbLink.mjs";
import { genSalt, hash } from "bcrypt-ts"; // Using bcrypt-ts for hashing
const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    // Step 1: Get and validate data from the request body
    const { user_name, user_surname, username, password } = req.body;
    if (!user_name || !user_surname || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Step 2: Hash the password using bcrypt-ts
    const saltRounds = 10;
    const salt = await genSalt(saltRounds); // Generate salt
    const hashedPassword = await hash(password, salt);

    // Step 3: Prepare and execute the query
    const query = `
      INSERT INTO users (user_name, user_surname, username, password, status, level)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [user_name, user_surname, username, hashedPassword];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error." });
      }

      // Step 4: Send a success response
      res.status(201).json({
        message: `User registered successfully! User is ${username}`,
        userId: results.insertId,
      });
    });
  } catch (error) {
    console.error(error);
    next(error); // Pass errors to the error handler
  }
});

export default router;
