const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  try {
    const { user_type, display_name, name, email, phone, password } = req.body;
    if (!user_type || !name || !email || !password || !display_name) {
      return res.json({ message: "Please provide all the required fields." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await pool.query(
      "INSERT INTO users(user_type,display_name,name,email,phone,password) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [user_type, display_name, name, email, phone, hashedPassword]
    );

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({
      success: true,
      message: "User created successfully",
      token: token,
      user: user.rows[0],
    });

    console.log(user);
  } catch (err) {
    console.log(err);
    res.json({ message: "Internal server error", err });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "Please provide all the required fields." });
    }
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log("token from login", token);
    res.json({ success: true, token, user: user.rows[0] });
  } catch (err) {
    console.log("Error while login", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (err) {
    console.error("Error in getUsers: ", err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      name,
      email,
      phone,
      age,
      gender,
      blood_group,
      address,
      emergency_name,
      emergency_phone,
      emergency_relation,
    } = req.body;

    const query =
      "UPDATE users SET name=$1,email=$2,phone=$3,age=$4,gender=$5,blood_group=$6,address=$7,emergency_name=$8,emergency_phone=$9,emergency_relation=$10 WHERE user_id=$11 RETURNING *";
    const updatedUser = await pool.query(query, [
      name,
      email,
      phone,
      age,
      gender,
      blood_group,
      address,
      emergency_name,
      emergency_phone,
      emergency_relation,
      user_id,
    ]);

    delete updatedUser.rows[0].password;
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.error("Error in updateProfile: ", err.message);
    res.json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};
