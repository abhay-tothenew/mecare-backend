const pool = require("../config/db");


exports.getDiseaseCategories = async (req, res) => {
    try{
        const diseaseCategories = await pool.query("SELECT * FROM disease_categories");
        res.json(diseaseCategories.rows);
    }catch(err){
        console.error("Error in getDiseaseCategories: ",err.message);
    }
}


exports.addDiseaseCategory = async (req,res)=>{
    try{
        const {category_name,category_tag} = req.body;
        const diseaseCategory = await pool.query("INSERT INTO disease_categories(category_name,category_tag) VALUES($1,$2) RETURNING *",[category_name,category_tag]);
        res.json({
            Success:"Disease category added successfully",
            category_id:diseaseCategory.rows[0].category_id
        });
    }catch(err){
        console.error("Error in addDiseaseCategory: ",err.message);
    }
}


exports.updateDiseaseCategory = async (req,res)=>{
    try{
        const {category_id,category_name} = req.body;
        const diseaseCategory = await pool.query("UPDATE disease_categories SET category_name=$1 WHERE category_id=$2 RETURNING *",[category_name,category_id]);
        res.json(diseaseCategory.rows[0]);
    }catch(err){
        console.error("Error in updateDiseaseCategory: ",err.message);
    }
}


exports.deleteDiseaseCategory = async (req,res)=>{
    try{
        const {category_id} = req.params;
        const diseaseCategory = await pool.query("DELETE FROM disease_categories WHERE category_id=$1",[category_id]);
        res.json(diseaseCategory.rows);
    }catch(err){        
        console.error("Error in deleteDiseaseCategory: ",err.message);
    }
}