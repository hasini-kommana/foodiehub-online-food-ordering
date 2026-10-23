function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: "An account with that email already exists." });
  if (err.name === "ValidationError") return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(", ") });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID supplied." });
  res.status(err.statusCode || 500).json({ message: err.message || "Internal server error." });
}

module.exports = { notFound, errorHandler };
