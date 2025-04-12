const { validationResult } = require("express-validator");
const { registerValidation } = require("../validators/registerValidator");
const { loginValidation } = require("../validators/loginValidator");

const validate = async (request, validator) => {
    await Promise.all(validator.map((v) => v.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return errors.array().map((e) => e.msg);
    }

    return [];
};

const validateRegister = async (req, res, next) => {
    const result = await validate(req, registerValidation);

    if (result.length > 0) {
        return res.status(400).json({
            messages: result,
        });
    }

    next();
};

const validateLogin = async (req, res, next) => {
    const result = await validate(req, loginValidation);

    if (result.length > 0) {
        return res.status(400).json({
            messages: result,
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
};
