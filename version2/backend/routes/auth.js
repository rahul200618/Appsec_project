import express from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateLogin, validateRegistration } from "../utils/validate.js";

const router = express.Router();

const BCRYPT_COST = 12;
// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again later." },
});

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { data, error } = validateRegistration(req.body);
    if (error) return res.status(400).json({ message: error });

    if (await User.findOne({ email: data.email })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hash = await bcrypt.hash(data.password, BCRYPT_COST);
    const user = await User.create({ name: data.name, email: data.email, password: hash });
    res.status(201).json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { data, error } = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error });

    const user = await User.findOne({ email: data.email });
    const ok = await bcrypt.compare(data.password, user ? user.password : DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  })
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email });
  })
);

export default router;
