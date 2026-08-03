const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config({ path: "./config/config.env" });

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/student");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "success", message: "EduTrack API is running 🚀" });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
});
