const express = require("express");

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.put("/:appointment_id", updateAppointmentStatus);
router.put("/details/:appointment_id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;
