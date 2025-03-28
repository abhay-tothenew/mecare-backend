const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { token } = require("morgan");
require("dotenv").config();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      console.log("req.user--->>", req.user);

      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: req.user.displayName,
          name: req.user.displayName,
          email: req.user.emails[0].value,
          password: req.user.id,
          user_type: "patient",
        }),
      });

      const data = await response.json();
      console.log("data---", data);

      const token = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      // localStorage.setItem("google_login", {
      //   token: token,
      //   user: data.user,
      // });

      if (data.message === "Internal server error") {
        res.redirect(process.env.FRONTEND_URL);
      }

      res.json({
        success: true,
        message: "User registered successfully",
        token: token,
        user: data.user,
      });

      res.redirect(process.env.FRONTEND_URL);
    } catch (err) {
      console.log("Error in google callback", err);
      const data = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: req.user.emails[0].value,
          password: req.user.id,
        }),
      });

      const response = await data.json();
      const token = jwt.sign(
        { id: response.user.id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      if (response.success) {
        // res.cookie("token", token, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === "production" || "development",
        //   sameSite: "Strict",
        //   maxAge: 60 * 60 * 1000,
        // });

        // res.cookie("user", JSON.stringify(user.rows[0]), {
        //   httpOnly: false,
        //   secure: process.env.NODE_ENV === "production" || "development",
        //   sameSite: "Strict",
        //   maxAge: 60 * 60 * 1000,
        // });

        res.redirect(process.env.FRONTEND_URL);
      }
    }
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.redirect("/");
  });
});

module.exports = router;
