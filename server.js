const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const http = require("http");
const passport = require("passport");
const server = http.createServer(app);

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/users", require("./routes/users"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/disease",require("./routes/disease"));
app.use("/api/slots",require("./routes/slots"));
app.use("/api/admin",require("./routes/admin"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
