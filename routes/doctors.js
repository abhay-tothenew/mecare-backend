const express = require("express");
const router = express.Router();

const{
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    getTopDoctors,
    getDoctorsBySpecialization
} = require("../controllers/doctorsController");


router.get("/",getDoctors);
router.get("/top6",getTopDoctors);
router.get("/specialization/:category_name",getDoctorsBySpecialization);
router.get("/:doctor_id",getDoctorById);
router.post("/",createDoctor);
router.put("/:id",updateDoctor);
router.delete("/:id",deleteDoctor);    

module.exports = router;