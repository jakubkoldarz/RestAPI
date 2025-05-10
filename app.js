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

app.use(express.json());
app.use("/auth", require("./routes/auth"));
app.use("/task", require("./routes/task"));
app.use("/chart", require("./routes/chart"));
app.use("/tag", require("./routes/tag"));

app.listen(PORT, () => console.log("App is running on port 3000"));
