const Hostel = require("../models/Hostel");
const ActivityLog = require("../models/ActivityLog");
const Student = require("../models/Student");

/**
 * @desc    Get hostel allocation for a student
 * @route   GET /api/hostel/student/:studentId
 * @access  Private
 */
const getStudentHostel = async (req, res, next) => {
  try {
    const allocation = await Hostel.findOne({ student: req.params.studentId });
    res.status(200).json({
      status: "success",
      allocation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Allocate or update hostel room for a student
 * @route   POST /api/hostel
 * @access  Private
 */
const allocateHostel = async (req, res, next) => {
  try {
    const { student, hostelName, roomNumber, bedNumber, monthlyRent } = req.body;

    if (!student || !hostelName || !roomNumber || !bedNumber || monthlyRent === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required hostel booking fields.",
      });
    }

    let allocation = await Hostel.findOne({ student });
    if (allocation) {
      allocation.hostelName = hostelName;
      allocation.roomNumber = roomNumber;
      allocation.bedNumber = bedNumber;
      allocation.monthlyRent = monthlyRent;
      await allocation.save();
    } else {
      allocation = await Hostel.create({ student, hostelName, roomNumber, bedNumber, monthlyRent });
    }

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Hostel Allocation",
        `Allocated ${hostelName} Room ${roomNumber} (Bed ${bedNumber}) for ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(200).json({
      status: "success",
      message: "Hostel room allocated successfully.",
      allocation,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete/Evict hostel allocation for student
 * @route   DELETE /api/hostel/student/:studentId
 * @access  Private
 */
const deleteHostel = async (req, res, next) => {
  try {
    const allocation = await Hostel.findOneAndDelete({ student: req.params.studentId });

    if (!allocation) {
      return res.status(404).json({ status: "error", message: "No hostel allocation found for student." });
    }

    const studentInfo = await Student.findById(req.params.studentId).select("name");
    if (studentInfo) {
      await ActivityLog.log("Hostel Allocation", `Vacated hostel room allocation for ${studentInfo.name}`, req.user.name);
    }

    res.status(200).json({
      status: "success",
      message: "Hostel room vacated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentHostel,
  allocateHostel,
  deleteHostel,
};
