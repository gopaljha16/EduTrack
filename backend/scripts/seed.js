/**
 * EduTrack — Admin Seeder Script
 * --------------------------------
 * Reads credentials from config/config.env and seeds
 * the initial admin user into the database.
 *
 * Usage:
 *   node scripts/seed.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("❌ Missing ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in config.env");
      process.exit(1);
    }

    // Delete existing admin if any to ensure fresh seed with correct password hash
    await User.deleteMany({ email: ADMIN_EMAIL });
    console.log(`🗑️  Cleared existing admin user with email: ${ADMIN_EMAIL}`);

    // Create admin
    const admin = await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Pre-save hook will hash this
      role:     "admin",
    });

    console.log("🎉 Admin seeded successfully!");
    console.log("─────────────────────────────");
    console.log(`   Name    : ${admin.name}`);
    console.log(`   Email   : ${admin.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}  ← use this to login`);
    console.log(`   Role    : ${admin.role}`);
    console.log("─────────────────────────────\n");
    console.log("👉 Start the app and login at http://localhost:4200/auth/login");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
