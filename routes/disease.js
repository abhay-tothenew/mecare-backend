const express = require("express");
const router = express.Router();

const {
    getDiseaseCategories,
    addDiseaseCategory,
    updateDiseaseCategory,
    deleteDiseaseCategory
} = require("../controllers/diseaseController");

router.get("/",getDiseaseCategories);
router.post("/",addDiseaseCategory);
router.put("/:id",updateDiseaseCategory);
router.delete("/:id",deleteDiseaseCategory);    

module.exports = router;    

