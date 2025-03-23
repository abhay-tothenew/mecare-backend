const pool = require("../config/db");
const moment = require("moment");

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await pool.query("SELECT * FROM appointments");
    res.json({
      message: "Appointments retrieved successfully",
      appointments: appointments.rows,
    });
  } catch (err) {
    console.error("Error in getAppointments: ", err.message);
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
      return res.status(404).json({ message: "No appointments found" });
    }

    res.json({
      message: "Appointments retrieved successfully",
      appointments: appointments.rows,
    });
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
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

    if (!["online", "in-person"].includes(appointment_type)) {
      return res.status(400).json({
        error: "Invalid appointment type. Choose 'online' or 'in-person'.",
      });
    }

    const startTime = moment(appointment_time, "HH:mm:ss").format("HH:mm:ss");
    const endTime = moment(startTime, "HH:mm:ss")
      .add(30, "minutes")
      .format("HH:mm:ss");

    let slotResult = await pool.query(
      `SELECT slot_id FROM slots WHERE doctor_id = $1 AND start_time = $2 AND slot_date = $3`,
      [doctor_id, startTime, appointment_date]
    );

    let slot_id;
    if (slotResult.rows.length === 0) {
      const newSlot = await pool.query(
        `INSERT INTO slots (doctor_id, start_time, end_time, slot_date, availability_status,slot_type) 
         VALUES ($1, $2, $3, $4,$5 FALSE) RETURNING slot_id`,
        [doctor_id, startTime, endTime, appointment_date, appointment_type]
      );
      slot_id = newSlot.rows[0].slot_id;
    } else {
      slot_id = slotResult.rows[0].slot_id;

      await pool.query(
        `UPDATE slots SET availability_status = FALSE WHERE slot_id = $1`,
        [slot_id]
      );
    }

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

    res.json({
      message: "Appointment created successfully!",
      appointment: appointmentResult.rows[0],
    });
  } catch (err) {
    console.error("Error creating appointment:", err.message);
    res.json({ error: "Internal server error", message: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { doctor_id, patient_id, appointment_date, appointment_time } =
      req.body;
    const appointment = await pool.query(
      "UPDATE appointments SET doctor_id=$1, patient_id=$2, appointment_date=$3, appointment_time=$4 WHERE appointment_id=$5 RETURNING *",
      [
        doctor_id,
        patient_id,
        appointment_date,
        appointment_time,
        appointment_id,
      ]
    );
    res.json(appointment.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

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
    res.json(appointment.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM appointments WHERE id = $1", [id]);
    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (err) {
    console.error(err.message);
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
