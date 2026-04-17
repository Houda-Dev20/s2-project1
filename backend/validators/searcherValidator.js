const { body, validationResult } = require("express-validator");

const validateSearcher = [

body("email").isEmail().withMessage("Invalid email").normalizeEmail(),

body("full_name").notEmpty().withMessage("Name is required").isLength({ min: 3 }).withMessage("Full name must be at least 3 characters"),

body("password")
.isLength({ min: 8 })
.withMessage("Password must be at least 8 characters")
.matches(/[0-9]/).withMessage("Password must contain at least one number")
.matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter"),

        body("telephon")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ min: 10, max: 10 }).withMessage("Phone number must be exactly 10 digits")
        .matches(/^\d+$/).withMessage("Phone number must contain only digits"),

         body("blood_type_research")
        .notEmpty().withMessage("Blood type is required")
        .isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage("Invalid blood type"),


body("date_of_birth")
.notEmpty().withMessage("Date of birth is required")
.isDate()
.withMessage("Invalid date")

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
        });
    }

next();

};

module.exports = { validateSearcher, checkValidation };