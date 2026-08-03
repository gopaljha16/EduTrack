const Transport = require("../models/Transport");
const ActivityLog = require("../models/ActivityLog");
const Student = require("../models/Student");

/**
 * @desc    Get transport route allocation for a student
 * @route   GET /api/transport/student/:studentId
 * @access  Private
 */
const getStudentTransport = async (req, res, next) => {
  try {
    const allocation = await Transport.findOne({ student: req.params.studentId });
    res.status(200).json({
      status: "success",
      allocation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Allocate or update transport bus seat route for a student
 * @route   POST /api/transport
 * @access  Private
 */
const allocateTransport = async (req, res, next) => {
  try {
    const { student, routeName, busNumber, driverName, driverPhone, monthlyFare } = req.body;

    if (!student || !routeName || !busNumber || !driverName || !driverPhone || monthlyFare === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required transport booking fields.",
      });
    }

    let allocation = await Transport.findOne({ student });
    if (allocation) {
      allocation.routeName = routeName;
      allocation.busNumber = busNumber;
      allocation.driverName = driverName;
      allocation.driverPhone = driverPhone;
      allocation.monthlyFare = monthlyFare;
      await allocation.save();
    } else {
      allocation = await Transport.create({ student, routeName, busNumber, driverName, driverPhone, monthlyFare });
    }

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Transport Allocation",
        `Allocated Route "${routeName}" (Bus ${busNumber}) for ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(200).json({
      status: "success",
      message: "Bus transport route allocated successfully.",
      allocation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel bus transport seat route for a student
 * @route   DELETE /api/transport/student/:studentId
 * @access  Private
 */
const deleteTransport = async (req, res, next) => {
  try {
    const allocation = await Transport.findOneAndDelete({ student: req.params.studentId });

    if (!allocation) {
      return res.status(404).json({ status: "error", message: "No transport route found for student." });
    }

    const studentInfo = await Student.findById(req.params.studentId).select("name");
    if (studentInfo) {
      await ActivityLog.log("Transport Allocation", `Cancelled bus transport route for ${studentInfo.name}`, req.user.name);
    }

    res.status(200).json({
      status: "success",
      message: "Bus transport seat route cancelled successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentTransport,
  allocateTransport,
  deleteTransport,
};
