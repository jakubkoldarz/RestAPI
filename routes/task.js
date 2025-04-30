const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    getTaskById,
    getAllTasks,
    insertTask,
    updateTask,
    deleteTask,
    setTags,
} = require("../controllers/taskController.js");
const {
    validateTask,
    validateMultipleTasksTags,
} = require("../middleware/validate.js");

router
    .get("/:id", authenticate, getTaskById)
    .get("/", authenticate, getAllTasks)
    .post("/", validateTask, authenticate, insertTask)
    .put("/:id", authenticate, updateTask)
    .delete("/:id", authenticate, deleteTask)
    .post("/set-tags", authenticate, validateMultipleTasksTags, setTags);

module.exports = router;
