const express = require("express");
const router = express.Router();

const{
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorsController");


router.get("/",getDoctors);
router.get("/:id",getDoctorById);
router.post("/",createDoctor);
router.put("/:id",updateDoctor);
router.delete("/:id",deleteDoctor);    

module.exports = router;