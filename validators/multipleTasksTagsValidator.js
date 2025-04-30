const { body } = require("express-validator");

module.exports = [
    body("tasks")
        .isArray()
        .withMessage("Tasks must be an array")
        .notEmpty()
        .withMessage("Tasks array cannot be empty"),
];
