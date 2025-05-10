const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    validateRegister,
    validateLogin,
    validatePassword,
} = require("../middleware/validate.js");
const {
    register,
    login,
    me,
    changePassword,
} = require("../controllers/authController.js");

router
    .post("/register", validateRegister, register)
    .post("/login", validateLogin, login)
    .post("/change-password", validatePassword, authenticate, changePassword)
    .get("/me", authenticate, me);

module.exports = router;
