const { token } = require("morgan");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const pool= require("../config/db");
// const rateLimit = require('express-rate-limit');
const cors = require('cors');

// console.log("---", process.env);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://mecare-backend.onrender.com/auth/google/callback",
    },

    async function (request, accessToken, refreshToken, profile, cb) {

      try{
        const user ={
          name:profile.displayName,
          email:profile.emails[0].value,
          picture:profile.photos[0].value,
          googleId :profile.id,
          token:accessToken
        };


        const result = await pool.query("SELECT * FROM users WHERE email=$1",[user.email]);


        if(result.rows.length>0){
          return cb(null,result.rows[0]);
        }


        await pool.query("INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *",[user.name,user.email,'',"patient"]);


        return cb(null,user);
        }catch(err){
          console.error("Error in google auth",err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
