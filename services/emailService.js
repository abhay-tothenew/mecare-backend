const nodemailer = require("nodemailer");
require("dotenv").config();



const emailService = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});



const sendMail = async(to,subject,message)=>{
    try{
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #007bff;">Appointment Status Update</h2>
          <p>${message}</p>
          <p>If you have any questions or need further assistance, feel free to contact us.</p>
          <br>
          <p>Best Regards,</p>
          <p><strong>MeCare Team</strong></p>
        </div>
      `;


      await emailService.sendMail({
        from :`"MeCare Team <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: message,
        html: htmlContent,
      
      });


      console.log("Email sent successfully to--->", to);
    }catch(err){
        console.error("Error in sending email",err);
    }
}


module.exports = sendMail;