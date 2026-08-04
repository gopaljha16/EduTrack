const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config({ path: "./config/config.env" });
dotenv.config();

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/student");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const behaviorRoutes = require("./routes/behaviorRoutes");
const ptmRoutes = require("./routes/ptmRoutes");
const examRoutes = require("./routes/examRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const transportRoutes = require("./routes/transportRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const medicalRoutes = require("./routes/medicalRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:4200',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/behavior", behaviorRoutes);
app.use("/api/ptm", ptmRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/medical", medicalRoutes);

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
