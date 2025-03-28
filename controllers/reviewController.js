const pool = require("../config/db");

exports.getReviews = async (req, res) => {
  try {
    const reviews = await pool.query("SELECT * FROM reviews");
    res.json({
      success: true,
      message: "Reviews fetched successfully",
      reviews: reviews.rows,
    });
  } catch (err) {
    console.error("Internal server error", err.message);
    res.json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

exports.addReview = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        success: false,
        message: "Unauthorized",
        error: "Invalid token",
      });
    }

    const { user_id, doctor_id, rating, review_text } = req.body;

    if (!user_id || !doctor_id || !rating) {
      return res.json({
        success: false,
        message: "Please provide all the required fields.",
        err: "Please provide all the required fields.",
      });
    }

    const users_id = await pool.query(
      "SELECT id FROM users WHERE user_id = $1",
      [user_id]
    );

    if (users_id.rows.length === 0) {
      return res.json({
        success: false,
        message: "User not found",
        err: "User not found",
      });
    }

    const doctors_id = await pool.query(
      "SELECT id FROM doctors WHERE doctor_id = $1",
      [doctor_id]
    );

    if (doctors_id.rows.length === 0) {
      return res.json({
        success: false,
        message: "Doctor not found",
        err: "Doctor not found",
      });
    }

    const review = await pool.query(
      "INSERT INTO reviews (user_id, doctor_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, doctor_id, rating, review_text]
    );

    res.json({
      success: true,
      message: "Review added successfully",
      review: review.rows,
    });
  } catch (err) {
    console.error("Error in addReview: ", err.message);
    res.json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        success: false,
        message: "Unauthorized",
        error: "Invalid token",
      });
    }

    const { id } = req.params;

    const review = await pool.query(
      "SELECT *, (SELECT AVG(rating) FROM reviews WHERE user_id = $1 OR doctor_id = $1) AS average_rating FROM reviews WHERE user_id = $1 OR doctor_id = $1",
      [id]
    );

    res.json({
      success: true,
      message: "Review fetched successfully",
      review: review.rows,
      average_rating:
        review.rows.length > 0 ? parseFloat(review.rows[0].average_rating).toFixed(1) : 0,
    });
  } catch (err) {
    console.error("Error in getReviewById: ", err.message);
    res.json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.json({
        success: false,
        message: "Unauthorized",
        error: "Invalid token",
      });
    }

    const { id } = req.params;

    const review = await pool.query("DELETE FROM reviews WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteReview: ", err.message);
    res.json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};
