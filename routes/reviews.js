const express = require("express");
const router = express.Router();

const {
  getReviews,
  addReview,
  getReviewById,
  deleteReview,
} = require("../controllers/reviewController");

router.get("/", getReviews);
router.post("/", addReview);
router.get("/:id", getReviewById);
router.delete("/:id", deleteReview);

module.exports = router;