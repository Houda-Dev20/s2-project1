const { body, validationResult } = require("express-validator");

const validateSearcher = [

body("email").isEmail().withMessage("Invalid email"),

body("full_name").notEmpty().withMessage("Name is required"),

body("password")
.isLength({ min: 8 })
.withMessage("Password must be at least 8 characters"),

body("date_of_birth")
.isDate()
.withMessage("Invalid date")

];

const checkValidation = (req, res, next) => {

const errors = validationResult(req);

if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}

next();

};

module.exports = { validateSearcher, checkValidation };