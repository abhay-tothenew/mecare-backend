const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");
const authenticateUser = require("../middleware/authMiddleware");
const pool = require("../config/db");
const {
  registerUser,
  loginUser,
  getUsers,
  updateProfile,
} = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allUsers", getUsers);
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    delete user.rows[0].password;
    res.json({
      message: "Profile fetched successfully",
      user: user.rows[0],
    });
  } catch (err) {
    console.error({
      message: "Internal server error",
      err: err.message,
    });
  }
});

router.put("/:user_id",updateProfile);
module.exports = router;
