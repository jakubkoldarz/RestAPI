const { body } = require("express-validator");

module.exports = [
    body("password")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Empty password provided"),
];
