const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

const PORT = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const taskRouter = require("./routes/task");
const graphRouter = require("./routes/graph.js");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/task", taskRouter);
app.use("/graph", graphRouter);

app.listen(PORT, () => console.log("App is running on port 3000"));
