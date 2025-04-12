const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    getWeeklyGraph,
    getMonthlyGraph,
    getCompletedGraph,
} = require("../controllers/graphController.js");

router
    .get("/weekly", authenticate, getWeeklyGraph)
    .get("/monthly", authenticate, getMonthlyGraph)
    .get("/completed", authenticate, getCompletedGraph);

module.exports = router;
