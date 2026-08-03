const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: String,
      required: true,
      default: "System",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Method to log system actions easily
activityLogSchema.statics.log = async function (action, details, performedBy = "Admin") {
  try {
    await this.create({ action, details, performedBy });
  } catch (err) {
    console.error("❌ Failed to create activity log:", err.message);
  }
};

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
