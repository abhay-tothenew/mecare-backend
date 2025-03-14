const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authMiddleware");

const { registerUser, loginUser,getUsers } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allUsers",authenticateJWT,getUsers);

module.exports = router;
