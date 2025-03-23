const pool = require("../config/db");

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await pool.query("SELECT * FROM doctors");
    res.json(doctors.rows);
  } catch (err) {
    console.error(err.message);
  }
};


exports.getDoctorById = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const doctor = await pool.query("SELECT * FROM doctors WHERE doctor_id = $1", [
      doctor_id,
    ]);
    res.json({
      message: "Doctor fetched successfully",
      doctor: doctor.rows[0],
    });
  } catch (err) {
    console.error(err.message);
  }
};

//for top 6 doctors

exports.getTopDoctors = async (req, res) => {
  try {
    const doctors = await pool.query(
      "SELECT * FROM doctors ORDER BY experience DESC LIMIT 6"
    );
    console.log(doctors.rows);
    res.json(doctors.rows);
  } catch (err) {
    console.error("Error in getTopDoctors: ", err.message);
  }
};

//fetch doctors based on specialization

exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const { category_name } = req.params;
    const catName = category_name.replaceAll(" ","_");
    const doctors = await pool.query(
      "SELECT * FROM doctors WHERE specialization = $1",
      [catName]
    );
    // console.log(category_name);
    res.json(doctors.rows);
  } catch (err) {
    console.error("Error in getDoctorsBySpecialization: ", err.message);
  }
};

exports.createDoctor = async (req, res) => {
  const {
    name,
    specialization,
    qualification,
    experience,
    location,
    phone,
    email,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO doctors (name, specialization, qualification, experience, location, phone, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, specialization, qualification, experience, location, phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, specialization, experience, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); //this will be changed to bcrypt later
    const doctor = await pool.query(
      "UPDATE doctors SET name=$1, email=$2, password_hash=$3, specialization=$4, experience=$5, bio=$6 WHERE id=$7 RETURNING *",
      [name, email, hashedPassword, specialization, experience, bio, id]
    );
    res.json(doctor.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await pool.query("DELETE FROM doctors WHERE id = $1", [id]);
    res.json(doctor.rows);
  } catch (err) {
    console.error(err.message);
  }
};

