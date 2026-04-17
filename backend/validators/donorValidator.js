const { body, validationResult } = require("express-validator");

const validateDonor = [

body("email").isEmail().withMessage("Invalid email"),

body("full_name").notEmpty().withMessage("Name is required")
.isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),

body("password")
.isLength({ min: 8 })
.withMessage("Password must be at least 8 characters")
.matches(/[0-9]/).withMessage("Password must contain at least one number")
.matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),

        body("telephon")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ min: 10, max: 10 }).withMessage("Phone number must be exactly 10 digits")
        .matches(/^\d+$/).withMessage("Phone number must contain only digits"),

        body("blood_type")
        .notEmpty().withMessage("Blood type is required")
        .isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage("Invalid blood type"),

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

}),


];

const checkValidation = (req, res, next) => {

const errors = validationResult(req);

if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));
        
        return res.status(400).json({ 
            message: "Validation failed",
            errors: formattedErrors 
        });}

next();

};

module.exports = { validateDonor, checkValidation };