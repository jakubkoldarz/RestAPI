const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    getCompletedChart,
    getWeeklyChart,
    getMonthlyChart,
} = require("../controllers/chartController");

router
    .get("/weekly", authenticate, getWeeklyChart)
    .get("/monthly", authenticate, getMonthlyChart)
    .get("/completed", authenticate, getCompletedChart);

module.exports = router;
