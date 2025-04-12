const { body } = require("express-validator");

module.exports = [
    body("email").isEmail().withMessage("Invalid email provided"),
    body("password").notEmpty().withMessage("Empty password provided"),
    body("username").notEmpty().withMessage("Empty username provided"),
];
