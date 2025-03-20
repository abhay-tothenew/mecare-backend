const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt"); //this is used to authenticate the user
const pool = require("./db");

require("dotenv").config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new Strategy(jwtOptions, async (payload, done) => {
    try {
      const user = await pool.query("SELECT * FROM users WHERE id = $1", [
        payload.id,
      ]);
      if (user.rows.length === 0) {
        return done(null, false);
      }
      return done(null, user.rows[0]);
    } catch (err) {
      console.error("Error in passport.js: ", err.message);
      return done(null, false);
    }
  })
);

module.exports = passport;
