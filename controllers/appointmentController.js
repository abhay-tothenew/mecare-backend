const pool = require("../config/db");

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await pool.query("SELECT * FROM appointments");
    res.json(appointments.rows);
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

    res.json(appointments.rows);
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
    } = req.body;

    if (!["online", "in-person"].includes(appointment_type)) {
      return res.status(400).json({
        error: "Invalid appointment type. Choose 'online' or 'in-person'.",
      });
    }

    // Check if a slot already exists for this doctor at this time
    let slotResult = await pool.query(
      `SELECT slot_id FROM slots WHERE doctor_id = $1 AND start_time = $2`,
      [doctor_id, appointment_time]
    );

    let slot_id;
    if (slotResult.rows.length === 0) {
      const newSlot = await pool.query(
        `INSERT INTO slots (doctor_id, start_time, end_time, availability_status) 
         VALUES ($1, $2, $3, FALSE) RETURNING slot_id`,
        [doctor_id, appointment_time, appointment_time] // TODO: add end_time
      );
      slot_id = newSlot.rows[0].slot_id;
    } else {
      slot_id = slotResult.rows[0].slot_id;
    }

    const appointmentResult = await pool.query(
      `INSERT INTO appointments (user_id, doctor_id, slot_id, appointment_type, appointment_date, appointment_time) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        user_id,
        doctor_id,
        slot_id,
        appointment_type,
        appointment_date,
        appointment_time,
      ]
    );

    res.status(201).json(appointmentResult.rows[0]);
  } catch (err) {
    console.error("Error creating appointment:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, patient_id, appointment_date, appointment_time } =
      req.body;
    const appointment = await pool.query(
      "UPDATE appointments SET doctor_id=$1, patient_id=$2, appointment_date=$3, appointment_time=$4 WHERE id=$5 RETURNING *",
      [doctor_id, patient_id, appointment_date, appointment_time, id]
    );
    res.json(appointment.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await pool.query(
      "DELETE FROM appointments WHERE id = $1",
      [id]
    );
    res.json(appointment.rows);
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
