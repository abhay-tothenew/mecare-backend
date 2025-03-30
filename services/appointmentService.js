const pool = require("../config/db");
const moment = require("moment");

/**
 * Check if there are any overlapping appointments for a doctor
 * @param {string} doctorId - The doctor's ID
 * @param {string} appointmentDate - The appointment date
 * @param {string} startTime - The appointment start time
 * @param {string} endTime - The appointment end time
 * @returns {Promise<boolean>} - True if there's an overlap, false otherwise
 */
const checkAppointmentOverlap = async (doctorId, appointmentDate, startTime, endTime) => {
  try {
    // Query to check for overlapping appointments
    const overlapQuery = `
      SELECT a.*, s.start_time, s.end_time
      FROM appointments a
      JOIN slots s ON a.slot_id = s.slot_id
      WHERE a.doctor_id = $1
      AND a.appointment_date = $2
      AND a.status != 'cancelled'
      AND (
        (s.start_time <= $3 AND s.end_time > $3) OR
        (s.start_time < $4 AND s.end_time >= $4) OR
        (s.start_time >= $3 AND s.end_time <= $4)
      )
    `;

    const result = await pool.query(overlapQuery, [
      doctorId,
      appointmentDate,
      startTime,
      endTime
    ]);

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking appointment overlap:', error);
    throw error;
  }
};

/**
 * Validate appointment time slot
 * @param {string} doctorId - The doctor's ID
 * @param {string} appointmentDate - The appointment date
 * @param {string} appointmentTime - The appointment time
 * @returns {Promise<{isValid: boolean, message: string}>} - Validation result
 */
const validateAppointmentSlot = async (doctorId, appointmentDate, appointmentTime) => {
  try {
    // Check if the appointment is in the past
    const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`);
    if (appointmentDateTime.isBefore(moment())) {
      return {
        isValid: false,
        message: "Cannot book appointments in the past"
      };
    }

    // Check if the appointment is too far in the future (e.g., 3 months)
    const maxFutureDate = moment().add(3, 'months');
    if (appointmentDateTime.isAfter(maxFutureDate)) {
      return {
        isValid: false,
        message: "Cannot book appointments more than 3 months in advance"
      };
    }

    // Calculate appointment duration (30 minutes)
    const startTime = moment(appointmentTime, "HH:mm:ss").format("HH:mm:ss");
    const endTime = moment(startTime, "HH:mm:ss")
      .add(30, "minutes")
      .format("HH:mm:ss");

    // Check for overlapping appointments
    const hasOverlap = await checkAppointmentOverlap(
      doctorId,
      appointmentDate,
      startTime,
      endTime
    );

    if (hasOverlap) {
      return {
        isValid: false,
        message: "This time slot overlaps with an existing appointment"
      };
    }

    return {
      isValid: true,
      message: "Time slot is valid",
      startTime,
      endTime
    };
  } catch (error) {
    console.error('Error validating appointment slot:', error);
    throw error;
  }
};

module.exports = {
  checkAppointmentOverlap,
  validateAppointmentSlot
}; 