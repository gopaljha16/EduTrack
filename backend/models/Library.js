const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    bookTitle: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Issued", "Returned", "Overdue"],
      default: "Issued",
    },
  },
  { timestamps: true }
);

const Library = mongoose.model("Library", librarySchema);
module.exports = Library;
