const passport = require("passport");

const auth_JWT = passport.authenticate("jwt",{session:false});
module.exports = auth_JWT;