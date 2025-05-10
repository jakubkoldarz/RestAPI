const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    getTaskById,
    getAllTasks,
    insertTask,
    updateTask,
    deleteTask,
    getWeeklyReport,
    getMonthlyReport,
    getYearlyReport,
    getAllTimeReport
    setTags,
} = require("../controllers/taskController.js");
const {
    validateTask,
    validateMultipleTasksTags,
} = require("../middleware/validate.js");

router
    .get("/report/week", authenticate, getWeeklyReport)
    .get("/report/month", authenticate, getMonthlyReport)
    .get("/report/year", authenticate, getYearlyReport)
    .get("/report", authenticate, getAllTimeReport)
    .get("/", authenticate, getAllTasks)
    .get("/:id", authenticate, getTaskById)
    .post("/", validateTask, authenticate, insertTask)
    .put("/:id", authenticate, updateTask)
    .delete("/:id", authenticate, deleteTask)
    .post("/set-tags", authenticate, validateMultipleTasksTags, setTags);

module.exports = router;
