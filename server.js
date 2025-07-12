const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Route files
const authRoutes = require("./routes/auth"); // ✅ Import auth routes
const testRoutes = require("./routes/test"); // ✅ Import test routes
const userRoutes = require("./routes/user"); // ✅ Import user routes
const campaignRoutes = require("./routes/campaign"); // ✅ Import campaign routes
const executionRoutes = require("./routes/execution"); // ✅ Import execution routes
const executionPageRoutes = require("./routes/executionPage"); // ✅ Import execution page routes
const dashboardRoutes = require("./routes/dashboard"); // ✅ Import dashboard routes

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Route usage
app.use("/api/auth", authRoutes); // ✅ Mount auth routes
app.use("/api/test", testRoutes); // ✅ Mount test routes
app.use("/api/users", userRoutes); // ✅ Mount user routes
app.use("/api/campaigns", campaignRoutes); // ✅ Mount campaign routes
app.use("/api/executions", executionRoutes); // ✅ Mount execution routes
app.use("/api/executions", executionPageRoutes); // ✅ Mount execution page routes
app.use("/api/dashboard", dashboardRoutes); // ✅ Mount dashboard routes

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
