import dotenv from "dotenv";
dotenv.config();

import app from "../src/app.js";
import connectDB from "../src/config/db.js";

let dbReady;

export default async function handler(req, res) {
  try {
    dbReady ||= connectDB();
    await dbReady;
    return app(req, res);
  } catch (error) {
    console.error("Vercel API bootstrap failed:", error);
    return res.status(500).json({
      success: false,
      message: "API bootstrap failed",
      errors: [error.message],
    });
  }
}
