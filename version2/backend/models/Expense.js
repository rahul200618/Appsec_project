import mongoose from "mongoose";
import { CATEGORIES } from "../utils/validate.js";

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0.01, max: 1000000000 },
    category: { type: String, enum: CATEGORIES, default: "Other" },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: "", maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
