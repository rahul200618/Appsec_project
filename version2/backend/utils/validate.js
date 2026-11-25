// Explicit allowlist + type validation. Only the fields listed here ever reach the database.
export const CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Shopping", "Health", "Other"];

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateExpense(body) {
  if (!isPlainObject(body)) return { error: "Invalid expense details" };
  const { title, amount, category = "Other", date, notes = "" } = body;

  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) {
    return { error: "Title is required (max 100 characters)" };
  }
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { error: "Amount must be a number" };
  }
  const rounded = Math.round(amount * 100) / 100;
  if (rounded <= 0 || rounded > 1000000000) {
    return { error: "Amount must be between 0.01 and 1,000,000,000" };
  }
  if (typeof category !== "string" || !CATEGORIES.includes(category)) {
    return { error: "Invalid category" };
  }
  let parsedDate = new Date();
  if (date !== undefined) {
    if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
      return { error: "Invalid date" };
    }
    parsedDate = new Date(date);
  }
  if (typeof notes !== "string" || notes.length > 500) {
    return { error: "Notes must be text (max 500 characters)" };
  }

  return {
    data: { title: title.trim(), amount: rounded, category, date: parsedDate, notes: notes.trim() },
  };
}

export function validateRegistration(body) {
  if (!isPlainObject(body)) return { error: "Invalid registration details" };
  const { name, email, password } = body;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 60) {
    return { error: "Name is required (max 60 characters)" };
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return { error: "A valid email is required" };
  }
  // bcrypt only uses the first 72 bytes
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
    return { error: "Password must be 8 to 72 characters" };
  }
  return { data: { name: name.trim(), email: email.trim().toLowerCase(), password } };
}

export function validateLogin(body) {
  if (!isPlainObject(body)) return { error: "Invalid login details" };
  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password || password.length > 72) {
    return { error: "Email and password are required" };
  }
  return { data: { email: email.trim().toLowerCase(), password } };
}
