import jwt from "jsonwebtoken";

// The secret comes from the environment only. There is deliberately no fallback value.
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET is not configured (at least 32 characters required)");
}

export function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
}

export function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    req.user = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
