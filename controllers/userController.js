const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { user_type,display_name, name, email, phone, password } = req.body;
    if (!user_type || !name || !email || !password || !phone || !display_name) {
      return res
        .status(400)
        .json({ message: "Please provide all the required fields." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await pool.query(
      "INSERT INTO users(user_type,display_name,name,email,phone,password) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [user_type,display_name,name,email,phone,hashedPassword]
    );
    res.status(201).json(user.rows[0]);

    console.log(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" ,err});
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all the required fields." });
    }
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET_KEY);
    res.status(200).json({ token });
  } catch (err) {
    console.log("Error while login",err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsers = async(req,res)=>{

    try{
        const users = await pool.query("SELECT * FROM users");
        res.json(users.rows);
    }catch(err){
        console.error("Error in getUsers: ",err.message);
    }
}
