const db = require("../db.js");

const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const { getTaskById, getAllTasks, insertTask, updateTask, deleteTask } = require("../controllers/taskController.js");

router
    .get("/:id", authenticate, getTaskById)
    .get("/", authenticate, getAllTasks)
    .post("/", authenticate, insertTask)
    .put("/:id", authenticate, updateTask)
    .delete("/:id", authenticate, deleteTask);

module.exports = router;
