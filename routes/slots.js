const express = require("express");

const router = express.Router();


const {
    getSlots,
    getSlotByDoctorId
} = require("../controllers/slotControllers");


router.get("/",getSlots);
router.get("/:doctor_id",getSlotByDoctorId);

module.exports = router;