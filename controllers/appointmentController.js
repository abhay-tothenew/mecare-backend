const pool = require("../config/db");
const moment = require("moment");
const sendMail = require("../services/emailService");
const { validateAppointmentSlot } = require("../services/appointmentService");

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await pool.query(
      "SELECT * FROM appointments ORDER BY id DESC"
    );
    res.json(appointments.rows);
  } catch (err) {
    console.error("Error in getAppointments: ", err.message);
    res.json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointments = await pool.query(
      "SELECT * FROM appointments WHERE user_id = $1 OR doctor_id = $1",
      [id]
    );

    if (appointments.rows.length === 0) {
      return res.json({
        success: false,
        message: "No appointments found for this user or doctor",
      });
    }

    res.json({
      success: true,
      message: "Appointments retrieved successfully",
      appointments: appointments.rows,
    });
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const {
      user_id,
      doctor_id,
      appointment_type,
      appointment_date,
      appointment_time,
      patient_name,
      phone_number,
      patient_email,
      patient_gender,
      patient_age,
      health_description,
    } = req.body;

    // First check for existing appointments
    const existingAppointment = await pool.query(
      `SELECT * FROM appointments 
       WHERE user_id = $1 
       AND doctor_id = $2 
       AND status IN ('pending', 'confirmed')`,
      [user_id, doctor_id]
    );

    if (existingAppointment.rows.length > 0) {
      return res.json({
        success: false,
        error:
          "You already have an appointment with this doctor. Please wait for your current appointment to complete or cancel it before booking a new one.",
      });
    }

    if (!["online", "in-person"].includes(appointment_type)) {
      return res.json({
        error: "Invalid appointment type. Choose 'online' or 'in-person'.",
      });
    }

    const slotValidation = await validateAppointmentSlot(
      doctor_id,
      appointment_date,
      appointment_time
    );

    if (!slotValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: slotValidation.message,
      });
    }

    const { startTime, endTime } = slotValidation;

    // Check if slot exists
    let slotResult = await pool.query(
      `SELECT slot_id FROM slots WHERE doctor_id = $1 AND start_time = $2 AND slot_date = $3`,
      [doctor_id, startTime, appointment_date]
    );

    let slot_id;
    if (slotResult.rows.length === 0) {
      const newSlot = await pool.query(
        `INSERT INTO slots (doctor_id, start_time, end_time, slot_date, availability_status, slot_type) 
         VALUES ($1, $2, $3, $4, FALSE, $5) RETURNING slot_id`,
        [doctor_id, startTime, endTime, appointment_date, appointment_type]
      );
      slot_id = newSlot.rows[0].slot_id;
    }

    // Create the appointment
    const appointmentResult = await pool.query(
      `INSERT INTO appointments (user_id, doctor_id, slot_id, appointment_type, appointment_date, appointment_time, patient_name, phone_number, patient_email, patient_gender, patient_age, health_description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        user_id,
        doctor_id,
        slot_id,
        appointment_type,
        appointment_date,
        startTime,
        patient_name,
        phone_number,
        patient_email,
        patient_gender,
        patient_age,
        health_description,
      ]
    );

    // Get doctor name for email
    const name = await pool.query(
      "SELECT name FROM doctors WHERE doctor_id = $1",
      [doctor_id]
    );

    const doctorName = name.rows[0].name;

    // Send confirmation email
    const user_email = patient_email;
    let subject = `MeCare - Your Appointment Status: Pending`;

    let message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <p>Dear <strong>${patient_name}</strong>,</p>
    
        <p>Your appointment details are as follows:</p>
    
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Doctor</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${doctorName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${appointment_date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${appointment_time}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${appointment_type}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>PENDING</strong></td>
          </tr>
        </table>
    
        <p style="margin-top: 20px;">`;

    await sendMail(user_email, subject, message);

    res.json({
      success: true,
      message: "Appointment created successfully and mail sent successfully",
      appointment: appointmentResult.rows[0],
    });
  } catch (err) {
    console.error("Error creating appointment:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { appointment_type, appointment_date, appointment_time } = req.body;
    const appointment = await pool.query(
      "UPDATE appointments SET appointment_type=$1, appointment_date=$2, appointment_time=$3 WHERE appointment_id=$4 RETURNING *",
      [appointment_type, appointment_date, appointment_time, appointment_id]
    );

    await pool.query(
      "UPDATE appointments SET status='pending' WHERE appointment_id=$1",
      [appointment_id]
    );

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: appointment.rows[0],
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

//FOR ADMIN PURPOSES - UPDATE APPOINTMENT STATUS
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        error:
          "Invalid appointment status. Choose 'pending','confirmed', 'completed', or 'cancelled'.",
      });
    }

    const appointment = await pool.query(
      "UPDATE appointments SET status=$1 WHERE appointment_id=$2 RETURNING *",
      [status, appointment_id]
    );

    if (appointment.rowCount === 0) {
      return res.json({
        error: "Appointment not found",
        message: "Appointment not found",
      });
    }

    const appointmentDB = appointment.rows[0];

    const user_details = await pool.query(
      "SELECT name, email FROM users WHERE user_id = $1",
      [appointmentDB.user_id]
    );

    if (user_details.rowCount === 0) {
      return res.json({
        error: "User not found",
        message: "User not found",
      });
    }

    const { name: patientName, email: user_email } = user_details.rows[0];

    const doctor_details = await pool.query(
      "SELECT name FROM doctors WHERE doctor_id = $1",
      [appointmentDB.doctor_id]
    );

    if (doctor_details.rowCount === 0) {
      return res.json({
        error: "Doctor not found",
        message: "Doctor not found",
      });
    }

    const doctorName = doctor_details.rows[0].name;

    let subject = `MeCare - Your Appointment Status: ${status}`;

    let message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <p>Dear <strong>${patientName}</strong>,</p>
    
        <p>Your appointment details are as follows:</p>
    
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Doctor</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${doctorName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              appointmentDB.appointment_date
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              appointmentDB.appointment_time
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              appointmentDB.appointment_type
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${status.toUpperCase()}</strong></td>
          </tr>
        </table>
    
        <p style="margin-top: 20px;">`;

    if (status === "pending") {
      message += `Your appointment request is <strong>pending confirmation</strong>.`;
    } else if (status === "confirmed") {
      message += `<strong>Great news!</strong> Your appointment has been <strong>confirmed</strong>. Please be on time.`;
    } else if (status === "cancelled") {
      message += `Your appointment has been <strong>cancelled</strong>. If this was not intentional, please rebook.`;
    } else if (status === "completed") {
      message += `Your appointment has been <strong>successfully completed</strong>. Thank you for choosing MeCare.`;
    }

    await sendMail(user_email, subject, message, true);

    res.json({
      success: true,
      message: "Appointment status updated and email sent successfully.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Unauthorized access",
      });
    }
    const { appointment_id } = req.params;

    await pool.query("DELETE FROM appointments WHERE appointment_id = $1", [
      appointment_id,
    ]);
    res.json({
      success: true,
      message: "Appointment deleted successfully",
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

// exports.cancelAppointment = async (req, res) => {
//   try {
//     const { appointment_id } = req.params;

//     const appointment = await pool.query(
//       `SELECT slot_id FROM appointments WHERE appointment_id = $1`,
//       [appointment_id]
//     );

//     if (appointment.rows.length === 0) {
//       return res.status(404).json({ error: "Appointment not found" });
//     }

//     const slot_id = appointment.rows[0].slot_id;

//     // Delete appointment
//     await pool.query(`DELETE FROM appointments WHERE appointment_id = $1`, [
//       appointment_id,
//     ]);

//     // Mark the slot as available
//     await pool.query(
//       `UPDATE slots SET availability_status = TRUE WHERE slot_id = $1`,
//       [slot_id]
//     );

//     res.json({ message: "Appointment cancelled and slot freed." });
//   } catch (err) {
//     console.error("Error cancelling appointment:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
