const { body } = require("express-validator");

const registerValidation = [
    body("email").isEmail().withMessage("Invalid email provided"),
    body("password")
        .isLength({ min: 3 })
        .withMessage("Empty password provided"),
    body("username")
        .isLength({ min: 3 })
        .withMessage("Empty username provided"),
];
module.exports = {
    registerValidation,
};
