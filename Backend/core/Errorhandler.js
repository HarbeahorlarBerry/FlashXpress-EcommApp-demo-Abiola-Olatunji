export const notFound = (req, res) =>
  res.status(404).json({ status: "error", message: "Route not found" });

// Express 5 forwards rejected async handlers here automatically.
export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.code === 11000) {
    status = 409;
    message = `Already exists: ${Object.keys(err.keyValue || {}).join(", ")}`;
  } else if (err.name === "MulterError") {
    status = 400;
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Internal server error";
  }
  res.status(status).json({ status: "error", message });
};