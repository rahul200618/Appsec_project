import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect); // all expense routes require authentication

// CREATE
router.post("/", async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    // BASELINE (intentional): whole body accepted -> Remediation 2 (allowlist + validation)
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// READ (list own expenses)
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ createdBy: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// READ one
router.get("/:id", async (req, res) => {
  try {
    // BASELINE (intentional): no ownership check -> Remediation 4 (broken access control)
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

export default router;
