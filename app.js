const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const taskRouter = require("./routes/task");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/task", taskRouter);

app.listen(PORT, () => console.log("App is running on port 3000"));
