// Wrap async route handlers so rejected promises reach the error handler.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

// Central error handler: details are logged on the server only, never sent to the client.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body" });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request body too large" });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid identifier" });
  if (err.name === "ValidationError") return res.status(400).json({ message: "Invalid data" });
  if (err.code === 11000) return res.status(409).json({ message: "Duplicate value" });

  console.error("Request failed:", err);
  res.status(500).json({ message: "Internal server error" });
}
