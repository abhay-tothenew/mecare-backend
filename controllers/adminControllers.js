const pool = require("../config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  try {
    const { admin_name, admin_email, admin_phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO admins (admin_name,admin_email,admin_phone,password) VALUES ($1,$2,$3,$4) RETURNING *`;
    const admin = await pool.query(query, [
      admin_name,
      admin_email,
      admin_phone,
      hashedPassword,
    ]);
    res.json({
      success: true,
      message: "Admin registered successfully",
      admin: admin.rows[0],
    });
  } catch (err) {
    console.error("Error in registerAdmin: ", err.message);
    res.json({
      success: false,
      message: "Internal server error",
      err: err.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { admin_email, password } = req.body;
    if (!admin_email || !password) {
      return res.json({ message: "Please provide all the required fields." });
    }
    const admin = await pool.query(
      "SELECT * FROM admins WHERE admin_email=$1",
      [admin_email]
    );
    if (admin.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.rows[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin.rows[0].id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin.rows[0].admin_id,
        name: admin.rows[0].admin_name,
        email: admin.rows[0].admin_email,
      },
    });
  } catch (err) {
    console.log("Error while login", err);
    res.json({ success: false, message: "Internal server error" });
  }
};
