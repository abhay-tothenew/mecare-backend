const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const passport = require("passport");
const session = require("express-session");

const app = express();
const http = require("http");
const server = http.createServer(app);

require("./config/googleAuth");

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/disease", require("./routes/disease"));
app.use("/api/slots", require("./routes/slots"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
