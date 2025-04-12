const { body } = require("express-validator");

const loginValidation = [
    body("password")
        .isLength({ min: 3 })
        .withMessage("Empty password provided"),
    body("username")
        .isLength({ min: 3 })
        .withMessage("Empty username provided"),
];
module.exports = {
    loginValidation,
};
