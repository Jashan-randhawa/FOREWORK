import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    dbConnected: isDbConnected,
    timestamp: new Date().toISOString(),
  });
});

export default router;
