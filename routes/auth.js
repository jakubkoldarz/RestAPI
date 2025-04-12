const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.js");
const {
    validateRegister,
    validateLogin,
} = require("../middleware/validate.js");
const { register, login, me } = require("../controllers/authController.js");

router
    .post("/register", validateRegister, register)
    .post("/login", validateLogin, login)
    .get("/me", authenticate, me);

module.exports = router;
