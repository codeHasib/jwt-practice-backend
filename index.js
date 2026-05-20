const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

// middleware
const verify = (req, res, next) => {
  console.log("verify mid is running");
  next();
};


app.get("/", verify, (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, console.log(`${process.env.PORT} is listening`));
