const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const userRouter = require("./routes/user");

app.use(express.json());
app.use("/user", userRouter);

app.listen(PORT, () => console.log("App is running on port 3000"));
