const { body } = require("express-validator");

module.exports = [
    body("name").notEmpty().withMessage("Empty task name provided"),
];
