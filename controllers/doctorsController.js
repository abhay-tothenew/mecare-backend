const pool = require("../config/db");

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await pool.query("SELECT * FROM doctors");
    res.json({
      success: true,
      message: "Doctors retrieved successfully",
      doctors: doctors.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const doctor = await pool.query(
      "SELECT * FROM doctors WHERE doctor_id = $1",
      [doctor_id]
    );
    res.json({
      success: true,
      message: "Doctor fetched successfully",
      doctor: doctor.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

//for top 6 doctors

exports.getTopDoctors = async (req, res) => {
  try {
    const doctors = await pool.query(
      "SELECT * FROM doctors ORDER BY experience DESC LIMIT 6"
    );
    // console.log(doctors.rows);
    res.json({
      success: true,
      message: "Top doctors retrieved successfully",
      doctors: doctors.rows,
    });
  } catch (err) {
    console.error("Error in getTopDoctors: ", err.message);
    res.json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

//fetch doctors based on specialization

exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const { category_name } = req.params;

    const catName = category_name.replaceAll("_", " ");
    console.log(catName);

    const doctors = await pool.query(
      "SELECT * FROM doctors WHERE specialization = $1",
      [catName]
    );

    const total_count = await pool.query(
      "SELECT COUNT(*) FROM doctors WHERE specialization = $1",
      [catName]
    );

    const total_doctors = total_count.rows[0].count;
    const total_pages = Math.ceil(total_doctors / 6);
    // console.log(category_name);
    res.json({
      success: true,
      message: "Doctors retrieved successfully",
      doctors: doctors.rows,
      Pagination: {
        total_doctors: total_doctors,
        total_pages: total_pages,
      },
    });
  } catch (err) {
    console.error("Error in getDoctorsBySpecialization: ", err.message);
    res.json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
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
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
      return res.json({
        success: false,
        message: "Unauthorized",
        error: "Invalid token",
      });
    }
    const result = await pool.query(
      `INSERT INTO doctors (name, specialization, qualification, experience, location, phone, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, specialization, qualification, experience, location, phone, email]
    );
    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params, req.body);
    const {
      name,
      email,
      specialization,
      experience,
      qualification,
      phone,
      location,
    } = req.body;
    const doctor = await pool.query(
      "UPDATE doctors SET name=$1, email=$2, specialization=$3, experience=$4, qualification=$5, phone=$6, location=$7 WHERE doctor_id=$8 RETURNING *",
      [
        name,
        email,
        specialization,
        experience,
        qualification,
        phone,
        location,
        id,
      ]
    );
    res.json({
      success: true,
      message: "Doctor updated successfully",
    });
  } catch (err) {
    console.error(err.message);
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const doctor = await pool.query(
      "DELETE FROM doctors WHERE doctor_id = $1",
      [doctor_id]
    );
    res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (err) {
    console.error(err.message);
  }
};
