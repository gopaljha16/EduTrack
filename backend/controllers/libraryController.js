const Library = require("../models/Library");
const Student = require("../models/Student");
const ActivityLog = require("../models/ActivityLog");

/**
 * @desc    Get all book checkouts for a student
 * @route   GET /api/library/student/:studentId
 * @access  Private
 */
const getStudentBooks = async (req, res, next) => {
  try {
    const books = await Library.find({ student: req.params.studentId }).sort({ issueDate: -1 });
    res.status(200).json({
      status: "success",
      count: books.length,
      books,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Issue a library book to a student
 * @route   POST /api/library
 * @access  Private
 */
const issueBook = async (req, res, next) => {
  try {
    const { student, bookTitle, author, isbn, dueDate } = req.body;

    if (!student || !bookTitle || !author || !dueDate) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in book title, author, and due date.",
      });
    }

    const checkout = await Library.create({
      student,
      bookTitle,
      author,
      isbn,
      dueDate,
      status: "Issued",
    });

    const studentInfo = await Student.findById(student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Library",
        `Issued library book "${bookTitle}" to ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(201).json({
      status: "success",
      message: "Library book checked out successfully.",
      checkout,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark book as returned
 * @route   PUT /api/library/:id/return
 * @access  Private
 */
const returnBook = async (req, res, next) => {
  try {
    const checkout = await Library.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ status: "error", message: "Library log not found." });
    }

    checkout.status = "Returned";
    checkout.returnDate = new Date();
    await checkout.save();

    const studentInfo = await Student.findById(checkout.student).select("name");
    if (studentInfo) {
      await ActivityLog.log(
        "Library",
        `Book "${checkout.bookTitle}" returned by ${studentInfo.name}`,
        req.user.name
      );
    }

    res.status(200).json({
      status: "success",
      message: "Library book marked as returned.",
      checkout,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete book checkout log
 * @route   DELETE /api/library/:id
 * @access  Private
 */
const deleteLibraryLog = async (req, res, next) => {
  try {
    const checkout = await Library.findByIdAndDelete(req.params.id);

    if (!checkout) {
      return res.status(404).json({ status: "error", message: "Library log not found." });
    }

    res.status(200).json({
      status: "success",
      message: "Library log record removed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentBooks,
  issueBook,
  returnBook,
  deleteLibraryLog,
};
