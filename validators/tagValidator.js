const { body } = require("express-validator");

module.exports = [
    body("name").notEmpty().withMessage("Tag name is required"),
    body("name")
        .isLength({ min: 3 })
        .withMessage("Tag name must be at least 3 characters long"),
    body("color").isHexColor().withMessage("Invalid color format"),
    body("color")
        .isLength({ min: 7, max: 7 })
        .withMessage("Color must be a hex color code"),
];
