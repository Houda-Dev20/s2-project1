const { body, validationResult } = require("express-validator");

const validateDonor = [

body("email").isEmail().withMessage("Invalid email"),

body("full_name").notEmpty().withMessage("Name is required"),

body("password")
.isLength({ min: 8 })
.withMessage("Password must be at least 8 characters"),

body("date_of_birth")
.isDate()
.withMessage("Invalid date")
.custom((value) => {

const today = new Date();
const birthDate = new Date(value);
const age = today.getFullYear() - birthDate.getFullYear();

if (age < 18) {
throw new Error("Donor must be at least 18 years old");
}

return true;

})

];

const checkValidation = (req, res, next) => {

const errors = validationResult(req);

if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}

next();

};

module.exports = { validateDonor, checkValidation };