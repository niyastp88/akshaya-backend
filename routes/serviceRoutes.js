import express from "express";
import Service from "../models/Service.js";

const router = express.Router();

// Add service
router.post("/", async (req, res) => {
  const service = await Service.create(req.body);
  res.json(service);
});

// Get all services
router.get("/", async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

export default router;