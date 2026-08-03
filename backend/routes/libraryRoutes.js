const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudentBooks,
  issueBook,
  returnBook,
  deleteLibraryLog,
} = require("../controllers/libraryController");

router.use(protect);

router.post("/", issueBook);
router.put("/:id/return", returnBook);
router.route("/student/:studentId").get(getStudentBooks);
router.delete("/:id", deleteLibraryLog);

module.exports = router;
