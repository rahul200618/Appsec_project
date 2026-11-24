import jwt from "jsonwebtoken";

// BASELINE (intentional, synthetic): fallback value to be detected by Semgrep/TruffleHog
// and removed during remediation (Step 29). It is NOT a real credential.
const jwtSecret = process.env.JWT_SECRET || "FAKE_CLASSROOM_SECRET";

export function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: "2h" });
}

export function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
