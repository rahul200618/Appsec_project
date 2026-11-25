import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateExpense } from "../utils/validate.js";

const router = express.Router();
router.use(protect); // all expense routes require authentication

const isObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

// CREATE: only allowlisted, validated fields; the owner always comes from the token
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { data, error } = validateExpense(req.body);
    if (error) return res.status(400).json({ message: error });
    const expense = await Expense.create({ ...data, createdBy: req.user.id });
    res.status(201).json(expense);
  })
);

// READ (list own expenses)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ createdBy: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  })
);

// READ one: ownership enforced; other users' records look like "not found"
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "Invalid expense id" });
    const expense = await Expense.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  })
);

// UPDATE
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "Invalid expense id" });
    const { data, error } = validateExpense(req.body);
    if (error) return res.status(400).json({ message: error });
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      data,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  })
);

// DELETE
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "Invalid expense id" });
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  })
);

export default router;
