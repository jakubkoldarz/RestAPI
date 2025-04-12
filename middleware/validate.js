const { validationResult } = require("express-validator");
const registerValidator = require("../validators/registerValidator");
const loginValidator = require("../validators/loginValidator");
const taskValidator = require("../validators/taskValidator");

const validate = async (request, validator) => {
    await Promise.all(validator.map((v) => v.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return errors.array().map((e) => e.msg);
    }

    return [];
};

const validateRegister = async (req, res, next) => {
    const result = await validate(req, registerValidator);

    if (result.length > 0) {
        return res.status(400).json({
            messages: result,
        });
    }

    next();
};

const validateLogin = async (req, res, next) => {
    const result = await validate(req, loginValidator);

    if (result.length > 0) {
        return res.status(400).json({
            messages: result,
        });
    }

    next();
};

const validateTask = async (req, res, next) => {
    const result = await validate(req, taskValidator);

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
    validateTask,
};
