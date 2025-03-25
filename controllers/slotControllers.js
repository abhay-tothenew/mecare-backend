const pool = require("../config/db");
const moment = require("moment");

exports.getSlots = async (req, res) => {
  try {
    const slots = await pool.query("SELECT * FROM slots");
    res.json({
      success: true,
      message: "Slots retrieved successfully",
      slots: slots.rows,
    });
  } catch (err) {
    console.error("Error in getSlots: ", err.message);
    res.json({
      message: "Internal server error",
      err: err.message,
    });
  }
};


exports.getSlotByDoctorId = async (req, res) => {
    try{
        const {doctor_id} = req.params;

        const slots = await pool.query("SELECT * FROM slots WHERE doctor_id = $1",[doctor_id]);

        res.json({
            success:true,
            message:"Slots retrieved successfully",
            slots:slots.rows
        })
    }catch(err){
        console.error("Error in getSlotByDoctorId: ",err.message);
        res.json({
            message:"Internal server error",
            err:err.message
        })
    }
}
